import { ChatRoom } from './chatRoom.do'
import { validatePsk, createSession, getSession } from './auth'

export { ChatRoom }

export interface Env {
  CHAT_ROOM: DurableObjectNamespace<ChatRoom>
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/login' && request.method === 'POST') {
      return handleLogin(request)
    }

    if (url.pathname === '/ws') {
      return handleWebSocket(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}

async function handleLogin(request: Request): Promise<Response> {
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

  const token = await createSession(user, body.psk)
  return new Response(JSON.stringify({ token, user }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const token = url.searchParams.get('session')
  if (!token) {
    return new Response('missing session', { status: 401 })
  }

  const session = getSession(token)
  if (!session) {
    return new Response('invalid session', { status: 401 })
  }

  const doId = env.CHAT_ROOM.idFromName('room')
  const doObj = env.CHAT_ROOM.get(doId)

  const doUrl = new URL(request.url)
  doUrl.searchParams.set('name', session.user.name)
  doUrl.searchParams.set('color', session.user.color)
  doUrl.searchParams.set('psk', session.psk)

  return doObj.fetch(new Request(doUrl, request))
}
