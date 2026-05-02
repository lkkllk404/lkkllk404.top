export interface User {
  name: string
  color: string
}

export const USERS: Record<string, User> = {
  icphbAns: { name: 'lkkllk404', color: '#7ee787' },
  w84ZxgYU: { name: 'user2',     color: '#c792ea' },
  'Rq$Jc4Z9': { name: 'user3',   color: '#ecc48d' },
  '47hGSyTi': { name: 'user4',   color: '#58a6ff' },
  'q!kX7m9@': { name: 'user5',   color: '#ff5370' },
}

export const PSK_LIST = Object.keys(USERS)
