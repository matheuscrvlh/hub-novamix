import client from './client.ts'

export type Module = {
    id: number
    name: string
    slug: string
    public_link: string
    private_link: string
    image: string
    status: boolean
}

export type ModulePayload = {
    name: string
    slug: string
    public_link: string
    private_link: string
    image: string
    status?: boolean
}

export async function getModules(token: string | null): Promise<Module[]> {
    return client({ url: '/modules', token, method: 'GET' })
}

export async function createModule(token: string | null, data: ModulePayload) {
    return client({ url: '/modules', token, method: 'POST', data })
}

export async function updateModule(token: string | null, id: number, data: ModulePayload) {
    return client({ url: '/modules', token, method: 'PUT', data: { id, ...data } })
}

export async function deleteModule(token: string | null, id: number, name: string) {
    return client({ url: '/modules', token, method: 'DELETE', data: { id, name } })
}
