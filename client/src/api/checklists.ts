import client from './client.ts'

export type ChecklistItem = {
    key: string
    label: string
    received: boolean
}

export type MyChecklist = {
    recipient: boolean
    sent_at: string | null
    observation: string
    items: ChecklistItem[]
}

export type ChecklistPayload = {
    items: { key: string; received: boolean }[]
    observation: string
}

export type ChecklistSubmission = {
    id: number
    user_name: string
    user_login: string
    sector_name: string | null
    items: ChecklistItem[]
    observation: string | null
    created_at: string
}

export type ChecklistNotification = {
    id: number
    checklist_id: number
    user_name: string
    items: ChecklistItem[]
    created_at: string
}

export async function getMyChecklist(token: string | null): Promise<MyChecklist> {
    return client({ url: '/checklists/me', token, method: 'GET' })
}

export async function sendChecklist(token: string | null, data: ChecklistPayload) {
    return client({ url: '/checklists', token, method: 'POST', data })
}

export async function getChecklists(token: string | null): Promise<ChecklistSubmission[]> {
    return client({ url: '/checklists', token, method: 'GET' })
}

export async function getChecklistNotifications(token: string | null): Promise<ChecklistNotification[]> {
    return client({ url: '/checklists/notifications', token, method: 'GET' })
}

export async function readChecklistNotification(token: string | null, id: number) {
    return client({ url: '/checklists/notifications', token, method: 'PUT', data: { id } })
}
