import { ChatRoom } from './chatRoom.do'

export { ChatRoom }

export interface Env {
  CHAT_ROOM: DurableObjectNamespace<ChatRoom>
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/login' && request.method === 'POST') {
      return handleLogin(request, env)
    }

    if (url.pathname === '/ws') {
      return handleWebSocket(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  return new Response('not implemented', { status: 501 })
}

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
  return new Response('not implemented', { status: 501 })
}
