import { useState, type ReactNode } from 'react'
import { decodeToken, type TokenBranch, type TokenPermission } from '../lib/jwt.ts'
import { AuthContext } from './auth-context.ts'

function decodePayload(token: string) {
    const payload = decodeToken(token)

    return {
        role: payload?.role ?? null,
        permissions: payload?.permissions ?? [],
        branchs: payload?.branchs ?? []
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const storedToken = localStorage.getItem('token')
    const initialPayload = storedToken ? decodePayload(storedToken) : null

    const [token, setToken] = useState<string | null>(storedToken)
    const [role, setRole] = useState<string | null>(initialPayload?.role ?? null)
    const [permissions, setPermissions] = useState<TokenPermission[]>(initialPayload?.permissions ?? [])
    const [branchs, setBranchs] = useState<TokenBranch[]>(initialPayload?.branchs ?? [])

    function login(token: string) {
        const decoded = decodePayload(token)

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
