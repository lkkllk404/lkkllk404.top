import { useEffect, useRef, useState, type FormEvent } from 'react'
import { connect, type ChatMessage, type WsHandle } from './socket'
import type { UserInfo } from './LoginPage'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toTimeString().slice(0, 5)
}

interface Props {
  token: string
  user: UserInfo
  onAuthFail?: () => void
}

export default function ChatPage({ token, user, onAuthFail }: Props) {
  const [messages, setMessages] = useState<(ChatMessage & { id: number })[]>([])
  const [usersCount, setUsersCount] = useState(0)
  const [totalUsers, setTotalUsers] = useState(5)
  const [status, setStatus] = useState('connecting')
  const [input, setInput] = useState('')
  const wsRef = useRef<WsHandle | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  useEffect(() => {
    const ws = connect(token, (msg) => {
      if (msg.type === 'history') {
        const historyMsgs = (msg.messages || []).map(m => ({ ...m, id: idRef.current++ }))
        setMessages((prev) => [...historyMsgs, ...prev])
      } else if (msg.type === 'users') {
        setUsersCount(msg.count ?? 0)
        setTotalUsers(msg.total ?? 5)
      } else {
        setMessages((prev) => [...prev, { ...msg, id: idRef.current++ }])
      }
    }, (s) => {
      setStatus(s)
    }, onAuthFail)
    wsRef.current = ws
    return () => ws.close()
  }, [token])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || !wsRef.current) return
    wsRef.current.send(input.trim())
    setInput('')
  }

  return (
    <div className="chat-page">
      <div className="chat-messages" ref={listRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-line chat-${msg.type}`}>
            {msg.type === 'msg' && (
              <>
                <span className="chat-time">[{formatTime(msg.time!)}]</span>
                {' '}
                <span className="chat-name" style={{ color: msg.color }}>
                  &lt;{msg.name}&gt;
                </span>
                {' '}
                <span className="chat-text">{msg.text}</span>
              </>
            )}
            {(msg.type === 'join' || msg.type === 'leave') && (
              <span className="chat-system">
                *** {msg.name} {msg.type === 'join' ? 'joined' : 'left'} ({formatTime(msg.time!)})
              </span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-bar">
        <span className="chat-prompt">&gt;</span>
        {' '}
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      </form>

      <div className="chat-status">
        {status === 'connected' && (
          <span className="chat-status-text">
            connected <span className="chat-status-count">{usersCount}/{totalUsers}</span> users
          </span>
        )}
        {status !== 'connected' && (
          <span className="chat-status-text chat-status-dim">{status}...</span>
        )}
        {' — '}
        <span className="chat-status-you" style={{ color: user.color }}>
          {user.name}
        </span>
      </div>
    </div>
  )
}
