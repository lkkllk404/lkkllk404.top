import { User, USERS } from './config'

interface Session {
  user: User
  psk: string
}

const sessionStore = new Map<string, Session>()

export function validatePsk(psk: string): User | null {
  return USERS[psk] ?? null
}

export async function createSession(user: User, psk: string): Promise<string> {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  sessionStore.set(token, { user, psk })
  return token
}

export function getSession(token: string): Session | null {
  return sessionStore.get(token) ?? null
}

export function deleteSession(token: string): void {
  sessionStore.delete(token)
}
