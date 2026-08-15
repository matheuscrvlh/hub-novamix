import client from './client.ts'

export type System = {
    id: number
    name: string
    link: string | null
    status: boolean
}

export type SystemPayload = {
    name: string
    link: string
    status?: boolean
}

export async function getSystems(token: string | null): Promise<System[]> {
    return client({ url: '/systems', token, method: 'GET' })
}

export async function createSystem(token: string | null, data: SystemPayload) {
    return client({ url: '/systems', token, method: 'POST', data })
}

export async function updateSystem(token: string | null, id: number, data: SystemPayload) {
    return client({ url: '/systems', token, method: 'PUT', data: { id, ...data } })
}

export async function deleteSystem(token: string | null, id: number, name: string) {
    return client({ url: '/systems', token, method: 'DELETE', data: { id, name } })
}
