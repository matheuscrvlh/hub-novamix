import { createContext } from 'react'
import type { TokenBranch, TokenPermission } from '../lib/jwt.ts'

export type AuthContextType = {
    token: string | null
    role: string | null
    permissions: TokenPermission[]
    branchs: TokenBranch[]
    login: (token: string) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
