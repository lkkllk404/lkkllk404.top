import { DurableObject } from 'cloudflare:workers'
import { MAX_USERS } from './config'

interface ClientInfo {
  name: string
  color: string
  psk: string
}

interface ChatMessage {
  type: 'msg' | 'join' | 'leave' | 'users' | 'pong'
  name?: string
  color?: string
  text?: string
  time?: string
  count?: number
  total?: number
}

export class ChatRoom extends DurableObject {
  private inited = false
  private d1: D1Database

  constructor(ctx: DurableObjectState, env: { chat_history: D1Database }) {
    super(ctx, env)
    this.d1 = env.chat_history
  }

  async fetch(request: Request): Promise<Response> {
    this.ensureSchema()

    const url = new URL(request.url)

    if (url.pathname === '/session' && request.method === 'PUT') {
      const body = await request.json() as { token: string; user: ClientInfo; psk: string }
      await this.ctx.storage.put(`session:${body.token}`, { name: body.user.name, color: body.user.color, psk: body.psk })
      return new Response('ok')
    }

    if (url.pathname === '/session' && request.method === 'DELETE') {
      const body = await request.json() as { token: string }
      await this.ctx.storage.delete(`session:${body.token}`)
      return new Response('ok')
    }

    const token = url.searchParams.get('session')
    if (!token) return new Response('missing session', { status: 401 })

    const session = await this.ctx.storage.get(`session:${token}`) as ClientInfo | undefined
    if (!session) return new Response('invalid session', { status: 401 })

    // Check already connected (skip pending entries — they are reconnecting)
    for (const ws of this.ctx.getWebSockets()) {
      const tags = this.ctx.getTags(ws)
      const existingToken = tags[0]
      if (existingToken === token) continue
      const existing = await this.ctx.storage.get(`session:${existingToken}`) as ClientInfo | undefined
      if (existing?.psk === session.psk) {
        return new Response('already connected', { status: 409 })
      }
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.ctx.acceptWebSocket(server, [token])

    await this.ctx.storage.put(`lastseen:${token}`, Date.now())
    await this.ctx.storage.setAlarm(Date.now() + 45000)

    // Send history to the new client
    const history = this.getHistory()
    if (history.length > 0) {
      server.send(JSON.stringify({ type: 'history', messages: history }))
    }

    // Check if this is a graceful reconnect within grace period
    const existing = this.ctx.storage.sql.exec('SELECT deadline FROM pending WHERE token = ?', token)
    const isReconnect = !!existing.raw().next().value
    if (isReconnect) {
      this.ctx.storage.sql.exec('DELETE FROM pending WHERE token = ?', token)
      // No join broadcast — user was never considered "gone"
    } else {
      await this.broadcast({ type: 'join', name: session.name, time: now() })
    }
    this.broadcastUserCount()

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, raw: string) {
    const tags = this.ctx.getTags(ws)
    const token = tags[0]
    const session = await this.ctx.storage.get(`session:${token}`) as ClientInfo | undefined
    if (!session) return

    let data: { type?: string; text?: string }
    try {
      data = JSON.parse(raw) as { type?: string; text?: string }
    } catch {
      return
    }

    await this.ctx.storage.put(`lastseen:${token}`, Date.now())

    if (data.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }))
      return
    }

    if (!data.text) return

    await this.broadcast({
      type: 'msg',
      name: session.name,
      color: session.color,
      text: data.text,
      time: now(),
    })
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
    await this.enterGracePeriod(ws)
  }

  async webSocketError(ws: WebSocket, _error: Error) {
    await this.enterGracePeriod(ws)
  }

  private async enterGracePeriod(ws: WebSocket) {
    const tags = this.ctx.getTags(ws)
    const token = tags[0]
    if (!token) return
    await this.ctx.storage.delete(`lastseen:${token}`)
    const session = await this.ctx.storage.get(`session:${token}`) as ClientInfo | undefined
    if (!session) return
    // Don't broadcast leave yet — give client 30s to reconnect
    const deadline = Date.now() + 30000
    this.ctx.storage.sql.exec(
      'INSERT OR REPLACE INTO pending (token, deadline) VALUES (?, ?)',
      token, deadline
    )
    const alarm = await this.ctx.storage.getAlarm()
    if (!alarm || alarm > deadline) {
      await this.ctx.storage.setAlarm(deadline)
    }
  }

  private ensureSchema() {
    if (this.inited) return
    this.ctx.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, type TEXT NOT NULL, name TEXT, color TEXT, text TEXT, time TEXT NOT NULL)'
    )
    this.ctx.storage.sql.exec(
      'CREATE TABLE IF NOT EXISTS pending (token TEXT PRIMARY KEY, deadline INTEGER NOT NULL)'
    )
    this.inited = true
  }

  async alarm() {
    this.ensureSchema()
    // Expire stale connections (no message in 300s)
    const idleDeadline = Date.now() - 300000
    for (const ws of this.ctx.getWebSockets()) {
      const tags = this.ctx.getTags(ws)
      const token = tags[0]
      const lastSeen = await this.ctx.storage.get(`lastseen:${token}`) as number | undefined
      if (!lastSeen || lastSeen < idleDeadline) {
        try { ws.close(4001, 'timeout') } catch { }
      }
    }

    // Expire grace periods
    const ms = Date.now()
    const pending = this.ctx.storage.sql.exec('SELECT token, deadline FROM pending')
    let nextAlarm = Infinity
    for (const row of pending.raw()) {
      const token = row[0] as string
      const deadline = row[1] as number
      if (deadline <= ms) {
        this.ctx.storage.sql.exec('DELETE FROM pending WHERE token = ?', token)
        const session = await this.ctx.storage.get(`session:${token}`) as ClientInfo | undefined
        if (session) {
          await this.broadcast({ type: 'leave', name: session.name, time: now() })
          this.broadcastUserCount()
        }
      } else if (deadline < nextAlarm) {
        nextAlarm = deadline
      }
    }

    // Schedule next check
    if (this.ctx.getWebSockets().length > 0 || nextAlarm < Infinity) {
      const next = Math.min(
        Date.now() + 45000,
        nextAlarm < Infinity ? nextAlarm : Infinity
      )
      if (next < Infinity) {
        await this.ctx.storage.setAlarm(next)
      }
    }
  }

  private async broadcast(msg: ChatMessage) {
    const payload = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload)
      } catch {
        // client may already be dead
      }
    }
    await this.storeMessage(msg)
  }

  private async storeMessage(msg: ChatMessage) {
    if (msg.type === 'users' || msg.type === 'pong' || msg.type === 'history') return
    this.ctx.storage.sql.exec(
      'INSERT INTO messages (type, name, color, text, time) VALUES (?, ?, ?, ?, ?)',
      msg.type, msg.name ?? null, msg.color ?? null, msg.text ?? null, msg.time ?? now()
    )
    // Archive excess messages to D1
    const cursor = this.ctx.storage.sql.exec('SELECT COUNT(*) as cnt FROM messages')
    const count = cursor.raw().next().value?.[0] ?? 0
    if (count <= 500) return

    const old = this.ctx.storage.sql.exec(
      'SELECT id, type, name, color, text, time FROM messages ORDER BY id ASC LIMIT ?',
      count - 500
    )
    const batch: D1PreparedStatement[] = []
    for (const row of old.raw()) {
      batch.push(
        this.d1.prepare('INSERT INTO messages (type, name, color, text, time) VALUES (?, ?, ?, ?, ?)')
          .bind(row[1], row[2], row[3], row[4], row[5])
      )
    }
    if (batch.length > 0) {
      await this.d1.batch(batch)
      this.ctx.storage.sql.exec(
        'DELETE FROM messages WHERE id IN (SELECT id FROM messages ORDER BY id ASC LIMIT ?)',
        count - 500
      )
    }
  }

  private getHistory(): ChatMessage[] {
    const cursor = this.ctx.storage.sql.exec(
      'SELECT type, name, color, text, time FROM messages ORDER BY id ASC LIMIT 50'
    )
    const messages: ChatMessage[] = []
    for (const row of cursor.raw()) {
      messages.push({
        type: row[0] as ChatMessage['type'],
        name: row[1] as string | undefined,
        color: row[2] as string | undefined,
        text: row[3] as string | undefined,
        time: row[4] as string | undefined,
      })
    }
    return messages
  }

  private broadcastUserCount() {
    const count = this.ctx.getWebSockets().length
    const msg: ChatMessage = { type: 'users', count, total: MAX_USERS }
    const payload = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload)
      } catch {
        // ignore
      }
    }
  }
}

function now(): string {
  return new Date().toISOString()
}
