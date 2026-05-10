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
): WsHandle {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${proto}://${location.host}/ws?session=${token}`

  let ws: WebSocket
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let timeoutTimer: ReturnType<typeof setTimeout> | null = null
  let closed = false

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
