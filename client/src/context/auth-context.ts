import { createContext } from 'react'
import type { TokenBranch, TokenPermission, TokenSector } from '../lib/jwt.ts'

export type AuthContextType = {
    token: string | null
    role: string | null
    permissions: TokenPermission[]
    branchs: TokenBranch[]
    sector: TokenSector | null
    login: (token: string) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
