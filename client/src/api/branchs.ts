import client from './client.ts'

export type Branch = {
    id: number
    name: string
    status: boolean
}

export type BranchPayload = {
    name: string
    status?: boolean
}

export async function getBranchs(token: string | null): Promise<Branch[]> {
    return client({ url: '/branchs', token, method: 'GET' })
}

export async function createBranch(token: string | null, data: BranchPayload) {
    return client({ url: '/branchs', token, method: 'POST', data })
}

export async function updateBranch(token: string | null, id: number, data: BranchPayload) {
    return client({ url: '/branchs', token, method: 'PUT', data: { id, ...data } })
}

export async function deleteBranch(token: string | null, id: number, name: string) {
    return client({ url: '/branchs', token, method: 'DELETE', data: { id, name } })
}
