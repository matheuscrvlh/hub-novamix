const BASE_URL = import.meta.env.VITE_API_URL

type ClientParams = {
    url: string,
    token: string | null,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: unknown
}

export default async function client({ url, token, method, data }: ClientParams) {
    const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(data !== undefined ? { 'Content-Type': 'application/json' } : {})
        },
        body: data !== undefined ? JSON.stringify(data) : undefined
    });

    const body = res.status === 204 ? null : await res.json().catch(() => null)

    if (!res.ok) {
        if (res.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        throw new Error(body?.error ?? `Erro ao efetuar o fetch do(a) ${url}.`)
    }

    return body
}
