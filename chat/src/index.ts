import { ChatRoom } from './chatRoom.do'
import { validatePsk, createToken } from './auth'

export { ChatRoom }

export interface Env {
  CHAT_ROOM: DurableObjectNamespace<ChatRoom>
  ASSETS: Fetcher
  chat_history: D1Database
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

    try {
      return await env.ASSETS.fetch(request)
    } catch {
      return new Response('not found', { status: 404 })
    }
  },
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  let body: { psk?: string }
  try {
    body = await request.json() as { psk?: string }
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  if (!body.psk) {
    return new Response(JSON.stringify({ error: 'psk required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const user = validatePsk(body.psk)
  if (!user) {
    return new Response(JSON.stringify({ error: 'access denied' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const token = createToken()

  const doId = env.CHAT_ROOM.idFromName('room')
  const doObj = env.CHAT_ROOM.get(doId)
  await doObj.fetch(new Request('https://do/session', {
    method: 'PUT',
    body: JSON.stringify({ token, user, psk: body.psk }),
  }))

  return new Response(JSON.stringify({ token, user }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
  const doId = env.CHAT_ROOM.idFromName('room')
  const doObj = env.CHAT_ROOM.get(doId)
  return doObj.fetch(new Request(request.url, request))
}
