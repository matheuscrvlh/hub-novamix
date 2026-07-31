export type TokenPermission = {
    module: string
    access: string
}

export type TokenBranch = {
    id: number
    name: string
}

export type TokenPayload = {
    sub: number
    role: string
    permissions: TokenPermission[]
    branchs: TokenBranch[]
}

export function decodeToken(token: string): TokenPayload | null {
    try {
        const payload = token.split('.')[1]
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(
            atob(normalized)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        )

        return JSON.parse(json)
    } catch {
        return null
    }
}
