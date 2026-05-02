import { DurableObject } from 'cloudflare:workers'

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

  async fetch(request: Request): Promise<Response> {
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

    // Check already connected (same PSK)
    for (const ws of this.ctx.getWebSockets()) {
      const tags = this.ctx.getTags(ws)
      const existingToken = tags[0]
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

    this.broadcast({ type: 'join', name: session.name, time: now() })
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

    this.broadcast({
      type: 'msg',
      name: session.name,
      color: session.color,
      text: data.text,
      time: now(),
    })
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
    const tags = this.ctx.getTags(ws)
    const token = tags[0]
    await this.ctx.storage.delete(`lastseen:${token}`)
    const session = await this.ctx.storage.get(`session:${token}`) as ClientInfo | undefined
    if (session) {
      this.broadcast({ type: 'leave', name: session.name, time: now() })
      this.broadcastUserCount()
    }
  }

  async webSocketError(ws: WebSocket, _error: Error) {
    const tags = this.ctx.getTags(ws)
    const token = tags[0]
    await this.ctx.storage.delete(`lastseen:${token}`)
    const session = await this.ctx.storage.get(`session:${token}`) as ClientInfo | undefined
    if (session) {
      this.broadcast({ type: 'leave', name: session.name, time: now() })
      this.broadcastUserCount()
    }
  }

  async alarm() {
    const deadline = Date.now() - 90000
    for (const ws of this.ctx.getWebSockets()) {
      const tags = this.ctx.getTags(ws)
      const token = tags[0]
      const lastSeen = await this.ctx.storage.get(`lastseen:${token}`) as number | undefined
      if (!lastSeen || lastSeen < deadline) {
        try { ws.close(4001, 'timeout') } catch { /* may already be dead */ }
      }
    }
    if (this.ctx.getWebSockets().length > 0) {
      await this.ctx.storage.setAlarm(Date.now() + 45000)
    }
  }

  private broadcast(msg: ChatMessage) {
    const payload = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload)
      } catch {
        // client may already be dead
      }
    }
  }

  private broadcastUserCount() {
    const msg: ChatMessage = { type: 'users', count: this.ctx.getWebSockets().length, total: 5 }
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
