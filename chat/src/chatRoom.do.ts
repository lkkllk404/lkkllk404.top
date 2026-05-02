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
  private sessions = new Map<string, ClientInfo>()
  private clients = new Map<WebSocket, ClientInfo>()

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/session' && request.method === 'PUT') {
      const body = await request.json() as { token: string; user: ClientInfo; psk: string }
      this.sessions.set(body.token, { name: body.user.name, color: body.user.color, psk: body.psk })
      return new Response('ok')
    }

    if (url.pathname === '/session' && request.method === 'DELETE') {
      const body = await request.json() as { token: string }
      this.sessions.delete(body.token)
      return new Response('ok')
    }

    const token = url.searchParams.get('session')
    if (!token) return new Response('missing session', { status: 401 })

    const session = this.sessions.get(token)
    if (!session) return new Response('invalid session', { status: 401 })

    for (const info of this.clients.values()) {
      if (info.psk === session.psk) {
        return new Response('already connected', { status: 409 })
      }
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server, ['chat'])
    this.clients.set(server, session)

    this.broadcast({ type: 'join', name: session.name, time: now() })
    this.broadcastUserCount()

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, raw: string) {
    const client = this.clients.get(ws)
    if (!client) return

    let data: { type?: string; text?: string }
    try {
      data = JSON.parse(raw) as { type?: string; text?: string }
    } catch {
      return
    }

    if (data.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }))
      return
    }

    if (!data.text) return

    this.broadcast({
      type: 'msg',
      name: client.name,
      color: client.color,
      text: data.text,
      time: now(),
    })
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
    const client = this.clients.get(ws)
    if (client) {
      this.clients.delete(ws)
      this.broadcast({ type: 'leave', name: client.name, time: now() })
      this.broadcastUserCount()
    }
  }

  async webSocketError(ws: WebSocket, _error: Error) {
    const client = this.clients.get(ws)
    if (client) {
      this.clients.delete(ws)
      this.broadcast({ type: 'leave', name: client.name, time: now() })
      this.broadcastUserCount()
    }
  }

  private broadcast(msg: ChatMessage) {
    const payload = JSON.stringify(msg)
    for (const ws of this.clients.keys()) {
      try {
        ws.send(payload)
      } catch {
        // client may already be dead
      }
    }
  }

  private broadcastUserCount() {
    const msg: ChatMessage = { type: 'users', count: this.clients.size, total: 5 }
    const payload = JSON.stringify(msg)
    for (const ws of this.clients.keys()) {
      try {
        ws.send(payload)
      } catch {
        // ignore dead clients
      }
    }
  }
}

function now(): string {
  const d = new Date()
  return d.toTimeString().slice(0, 5)
}
