export interface User {
  name: string
  color: string
}

export const USERS: Record<string, User> = {
  'icphbAns': { name: 'lkkllk404', color: '#7ee787' },
  'w84ZxgYU': { name: '猫猫',      color: '#c792ea' },
  'Rq$Jc4Z9': { name: 'ec-lic',    color: '#ecc48d' },
  '47hGSyTi': { name: '网管',      color: '#58a6ff' },
  'q!kX7m9@': { name: 'user5',     color: '#ff5370' },
  'B2mKsL5!': { name: 'user6',     color: '#89ddff' },
  'H3nPq8@x': { name: 'user7',     color: '#f78c6c' },
  'T9vWm4$z': { name: 'user8',     color: '#b2ccd6' },
  'K5jFg1#p': { name: 'user9',     color: '#c3e88d' },
  'X7yNm3!q': { name: 'user10',    color: '#ffcb6b' },
  'L4tRs9@w': { name: 'user11',    color: '#f07178' },
  'P6kVb2#e': { name: 'user12',    color: '#82aaff' },
  'D8cWn5!r': { name: 'user13',    color: '#a1efd3' },
  'M3jFg7@t': { name: 'user14',    color: '#d4a0ff' },
  'Z9xQm1#y': { name: 'user15',    color: '#ee99a0' },
}

export const PSK_LIST = Object.keys(USERS)
export const MAX_USERS = PSK_LIST.length
