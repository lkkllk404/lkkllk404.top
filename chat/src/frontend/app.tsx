import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import LoginPage, { type UserInfo } from './LoginPage'
import ChatPage from './ChatPage'
import './app.css'

function App() {
  const [page, setPage] = useState<'login' | 'chat'>('login')
  const [token, setToken] = useState('')
  const [user, setUser] = useState<UserInfo | null>(null)

  function handleLogin(t: string, u: UserInfo) {
    setToken(t)
    setUser(u)
    setPage('chat')
  }

  if (page === 'chat' && user) {
    return <ChatPage token={token} user={user} />
  }

  return <LoginPage onLogin={handleLogin} />
}

createRoot(document.getElementById('root')!).render(<App />)
