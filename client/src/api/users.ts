import client from './client.ts'

export type UserRole = 'user' | 'admin'

export type User = {
    id: number
    name: string
    login: string
    role: UserRole
    status: boolean
    created_at: string
}

export type UserPayload = {
    name: string
    login: string
    password?: string
    role: UserRole
    status: boolean
}

export async function getUsers(token: string | null): Promise<User[]> {
    return client({ url: '/users', token, method: 'GET' })
}

export async function createUser(token: string | null, data: UserPayload) {
    return client({ url: '/user', token, method: 'POST', data })
}

export async function updateUser(token: string | null, id: number, data: UserPayload) {
    return client({ url: '/user', token, method: 'PUT', data: { id, ...data } })
}

export async function deleteUser(token: string | null, id: number) {
    return client({ url: '/user', token, method: 'DELETE', data: { id } })
}
