import { DurableObject } from 'cloudflare:workers'

interface ClientInfo {
  name: string
  color: string
  psk: string
}

interface ChatMessage {
  type: 'msg' | 'join' | 'leave' | 'users' | 'error'
  name?: string
  color?: string
  text?: string
  time?: string
  count?: number
  total?: number
}

export class ChatRoom extends DurableObject {
  private clients = new Map<WebSocket, ClientInfo>()

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const name = url.searchParams.get('name')
    const color = url.searchParams.get('color')
    const psk = url.searchParams.get('psk')

    if (!name || !color || !psk) {
      return new Response('missing user params', { status: 400 })
    }

    for (const info of this.clients.values()) {
      if (info.psk === psk) {
        return new Response('already connected from another session', { status: 409 })
      }
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)
    this.clients.set(server, { name, color, psk })

    this.broadcast({ type: 'join', name, time: now() })
    this.broadcastUserCount()

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, raw: string) {
    const client = this.clients.get(ws)
    if (!client) return

    let data: { text?: string }
    try {
      data = JSON.parse(raw) as { text?: string }
    } catch {
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

  async webSocketClose(ws: WebSocket) {
    const client = this.clients.get(ws)
    if (client) {
      this.clients.delete(ws)
      this.broadcast({ type: 'leave', name: client.name, time: now() })
      this.broadcastUserCount()
    }
  }

  async webSocketError(ws: WebSocket) {
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
    const total = 5
    const msg: ChatMessage = { type: 'users', count: this.clients.size, total }
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
