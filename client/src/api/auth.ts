import client from './client.ts'

type AuthParams = {
    user: string,
    password: string
}

export async function auth({ user, password }: AuthParams) {
    const result = await client({
        url: '/auth/login',
        token: null,
        method: 'POST',
        data: { user, password }
    })

    return result
}
