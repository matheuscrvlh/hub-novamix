import client from './client.ts'

export type UserRole = 'user' | 'admin'

export type UserPermission = {
    module_id: number
    module: string
    access: string
}

export type UserBranch = {
    id: number
    name: string
}

export type User = {
    id: number
    name: string
    login: string
    role: UserRole
    status: boolean
    created_at: string
    permissions: UserPermission[]
    branchs: UserBranch[]
}

export type UserPayload = {
    name: string
    login: string
    password?: string
    role: UserRole
    status: boolean
    permissions?: { module_id: number; access: string }[]
    branchs_id?: number[]
}

export async function getUsers(token: string | null): Promise<User[]> {
    return client({ url: '/users', token, method: 'GET' })
}

export async function createUser(token: string | null, data: UserPayload) {
    return client({ url: '/users', token, method: 'POST', data })
}

export async function updateUser(token: string | null, id: number, data: UserPayload) {
    return client({ url: '/users', token, method: 'PUT', data: { id, ...data } })
}

export async function deleteUser(token: string | null, id: number) {
    return client({ url: '/users', token, method: 'DELETE', data: { id } })
}

export type Me = {
    id: number
    name: string
    login: string
    role: UserRole
    status: boolean
}

export type MePayload = {
    name: string
    login: string
    password?: string
}

export async function getMe(token: string | null): Promise<Me> {
    return client({ url: '/users/me', token, method: 'GET' })
}

export async function updateMe(token: string | null, data: MePayload) {
    return client({ url: '/users/me', token, method: 'PUT', data })
}
