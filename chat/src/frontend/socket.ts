export interface ChatMessage {
  type: 'msg' | 'join' | 'leave' | 'users' | 'pong'
  name?: string
  color?: string
  text?: string
  time?: string
  count?: number
  total?: number
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

  onStatus('connecting')

  const ws = new WebSocket(url)
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let closed = false

  ws.onopen = () => {
    onStatus('connected')
    heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data as string) as ChatMessage
      onMessage(msg)
    } catch {
      /* ignore malformed */
    }
  }

  ws.onclose = () => {
    if (closed) return
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    onStatus('disconnected')
    setTimeout(() => {
      if (closed) return
      onStatus('reconnecting')
      const h = connect(token, onMessage, onStatus)
      // capture the new ws for the send/close closures
      ;(h as unknown as { _ws: WebSocket })._ws
    }, 2000)
  }

  ws.onerror = () => {
    // let onclose handle cleanup and reconnect
  }

  return {
    send(text: string) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }))
      }
    },
    close() {
      closed = true
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      ws.close()
    },
  }
}
