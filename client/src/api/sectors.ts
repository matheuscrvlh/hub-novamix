import client from './client.ts'

export type Sector = {
    id: number
    name: string
    status: boolean
}

export type SectorPayload = {
    name: string
    status?: boolean
}

export async function getSectors(token: string | null): Promise<Sector[]> {
    return client({ url: '/sectors', token, method: 'GET' })
}

export async function createSector(token: string | null, data: SectorPayload) {
    return client({ url: '/sectors', token, method: 'POST', data })
}

export async function updateSector(token: string | null, id: number, data: SectorPayload) {
    return client({ url: '/sectors', token, method: 'PUT', data: { id, ...data } })
}

export async function deleteSector(token: string | null, id: number, name: string) {
    return client({ url: '/sectors', token, method: 'DELETE', data: { id, name } })
}
