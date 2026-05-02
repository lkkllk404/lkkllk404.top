export interface ChatMessage {
  type: 'msg' | 'join' | 'leave' | 'users' | 'pong' | 'history'
  name?: string
  color?: string
  text?: string
  time?: string
  count?: number
  total?: number
  messages?: ChatMessage[]
}

export interface WsHandle {
  send: (text: string) => void
  close: () => void
}

export function connect(
  token: string,
  onMessage: (msg: ChatMessage) => void,
  onStatus: (status: string) => void,
  onAuthFail?: () => void,
): WsHandle {
  const wsHost = import.meta.env.DEV ? `${location.hostname}:8787` : location.host
  const proto = import.meta.env.DEV ? 'ws' : location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${proto}://${wsHost}/ws?session=${token}`

  let ws: WebSocket
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let timeoutTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false
  let reconnectFails = 0

  function resetTimeout() {
    if (timeoutTimer) clearTimeout(timeoutTimer)
    timeoutTimer = setTimeout(() => {
      ws.close()
    }, 70000)
  }

  function stopTimers() {
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
    if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null }
  }

  function setup(sock: WebSocket) {
    ws = sock

    sock.onopen = () => {
      reconnectFails = 0
      onStatus('connected')
      heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)
      resetTimeout()
    }

    sock.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as ChatMessage
        onMessage(msg)
      } catch { /* ignore malformed */ }
      resetTimeout()
    }

    sock.onclose = () => {
      if (closed) return
      stopTimers()
      onStatus('disconnected')
      reconnectFails++
      if (reconnectFails >= 5) {
        onAuthFail?.()
        return
      }
      setTimeout(() => {
        if (closed) return
        onStatus('reconnecting')
        setup(new WebSocket(url))
      }, 2000)
    }

    sock.onerror = () => {
      // onclose will fire after this
    }
  }

  setup(new WebSocket(url))

  return {
    send(text: string) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }))
      }
    },
    close() {
      closed = true
      stopTimers()
      ws.close()
    },
  }
}
