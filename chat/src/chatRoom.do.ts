import { DurableObject } from 'cloudflare:workers'

export class ChatRoom extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  async fetch(request: Request): Promise<Response> {
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    const sockets = this.ctx.getWebSockets()
    for (const socket of sockets) {
      socket.send(message)
    }
  }

  async webSocketClose(ws: WebSocket) {
    ws.close()
  }
}
