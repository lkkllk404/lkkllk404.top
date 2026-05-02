import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import LoginPage, { type UserInfo } from './LoginPage'
import ChatPage from './ChatPage'
import './app.css'

const STORAGE_KEY = 'chat_session'

function App() {
  const [page, setPage] = useState<'login' | 'chat'>('login')
  const [token, setToken] = useState('')
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { token: t, user: u } = JSON.parse(saved)
        if (t && u) {
          setToken(t)
          setUser(u)
          setPage('chat')
        }
      } catch { /* ignore */ }
    }
  }, [])

  function handleLogin(t: string, u: UserInfo) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, user: u }))
    setToken(t)
    setUser(u)
    setPage('chat')
  }

  function handleAuthFail() {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setUser(null)
    setPage('login')
  }

  if (page === 'chat' && user) {
    return <ChatPage token={token} user={user} onAuthFail={handleAuthFail} />
  }

  return <LoginPage onLogin={handleLogin} />
}

createRoot(document.getElementById('root')!).render(<App />)
