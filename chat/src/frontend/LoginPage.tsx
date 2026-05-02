import { useState, type FormEvent } from 'react'

export interface UserInfo {
  name: string
  color: string
}

interface Props {
  onLogin: (token: string, user: UserInfo) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [psk, setPsk] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!psk) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ psk }),
      })
      const data = (await res.json()) as { token?: string; user?: UserInfo; error?: string }
      if (!res.ok || data.error) {
        setError(data.error || 'access denied')
      } else if (data.token && data.user) {
        onLogin(data.token, data.user)
      }
    } catch {
      setError('connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <pre className="login-banner">
        {'$ ssh chat.lkkllk404.top'}
      </pre>

      <form onSubmit={handleSubmit} className="login-form">
        <label className="login-label">
          <span className="login-prompt">password:</span>
          {' '}
          <input
            type="password"
            className="login-input"
            value={psk}
            onChange={(e) => setPsk(e.target.value)}
            autoFocus
            disabled={loading}
          />
        </label>
      </form>

      {error && <p className="login-error">{error}</p>}
      {loading && <p className="login-status">verifying...</p>}
    </div>
  )
}
