export interface ChatMessage {
  type: 'msg' | 'join' | 'leave' | 'users'
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

  let ws = new WebSocket(url)

  ws.onopen = () => {
    onStatus('connected')
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
    onStatus('disconnected')
    setTimeout(() => {
      onStatus('reconnecting')
      const h = connect(token, onMessage, onStatus)
      ws = (h as unknown as { _ws: WebSocket })._ws
    }, 2000)
  }

  ws.onerror = () => {
    ws.close()
  }

  return {
    send(text: string) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }))
      }
    },
    close() {
      ws.close()
    },
  }
}
