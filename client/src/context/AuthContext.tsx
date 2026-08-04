import { useState, type ReactNode } from 'react'
import { decodeToken, isTokenExpired, type TokenBranch, type TokenPermission } from '../lib/jwt.ts'
import { AuthContext } from './auth-context.ts'

function decodePayload(token: string) {
    const payload = decodeToken(token)

    if (!payload || isTokenExpired(payload)) {
        return null
    }

    return {
        role: payload.role ?? null,
        permissions: payload.permissions ?? [],
        branchs: payload.branchs ?? []
    }
}

function getInitialToken() {
    const storedToken = localStorage.getItem('token')

    if (!storedToken || !decodePayload(storedToken)) {
        localStorage.removeItem('token')
        return null
    }

    return storedToken
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const storedToken = getInitialToken()
    const initialPayload = storedToken ? decodePayload(storedToken) : null

    const [token, setToken] = useState<string | null>(storedToken)
    const [role, setRole] = useState<string | null>(initialPayload?.role ?? null)
    const [permissions, setPermissions] = useState<TokenPermission[]>(initialPayload?.permissions ?? [])
    const [branchs, setBranchs] = useState<TokenBranch[]>(initialPayload?.branchs ?? [])

    function login(token: string) {
        const decoded = decodePayload(token)

        if (!decoded) {
            return
        }

        localStorage.setItem('token', token)
        setToken(token)
        setRole(decoded.role)
        setPermissions(decoded.permissions)
        setBranchs(decoded.branchs)
    }

    function logout() {
        localStorage.removeItem('token')
        setToken(null)
        setRole(null)
        setPermissions([])
        setBranchs([])
    }

    return (
        <AuthContext.Provider value={{ token, role, permissions, branchs, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
