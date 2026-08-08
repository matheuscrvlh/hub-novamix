import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import { getMe, updateMe, type Me } from '../api/users.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
import Alert from '../components/Alert.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'

type FormState = {
    name: string
    login: string
    password: string
}

const emptyForm: FormState = { name: '', login: '', password: '' }

export default function Account() {
    const { token, role, logout } = useAuth()
    const navigate = useNavigate()

    const [, setMe] = useState<Me | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [form, setForm] = useState<FormState>(emptyForm)
    const [salvando, setSalvando] = useState(false)
    const [formErro, setFormErro] = useState('')
    const [sucesso, setSucesso] = useState('')

    async function loadMe() {
        setLoading(true)
        setErro('')

        try {
            const result = await getMe(token)
            setMe(result)
            setForm({ name: result.name, login: result.login, password: '' })
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar dados da conta.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadMe()
    }, [])

    function handleLogout() {
        logout()
        navigate('/login')
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setSalvando(true)
        setFormErro('')
        setSucesso('')

        try {
            await updateMe(token, {
                name: form.name,
                login: form.login,
                ...(form.password ? { password: form.password } : {})
            })

            setSucesso('Conta atualizada com sucesso.')
            setForm((prev) => ({ ...prev, password: '' }))
            await loadMe()
        } catch (error) {
            setFormErro(error instanceof Error ? error.message : 'Erro ao salvar conta.')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <main className='w-full min-h-screen bg-gray dark:bg-dark-bg flex flex-col'>
            <header className='w-full bg-white dark:bg-dark-surface shadow-sm flex items-center justify-between px-6'>
                <Logo compact />

                <div className='flex items-center gap-4'>
                    <Link
                        to={role === 'admin' ? '/admin' : '/home'}
                        className='text-sm font-medium text-gray-text dark:text-dark-text hover:text-orange-base transition'
                    >
                        ← Voltar
                    </Link>
                    <Button variant='ghost' onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            </header>

            <section className='flex-1 w-full max-w-md mx-auto px-6 py-10'>
                <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                    Minha conta
                </h1>
                <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-8'>
                    Atualize as informações da sua conta.
                </p>

                {erro && (
                    <div className='mb-4'>
                        <Alert>{erro}</Alert>
                    </div>
                )}

                {loading ? (
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>Carregando...</p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className='flex flex-col gap-3 rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6'
                    >
                        <Input
                            placeholder='Nome'
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            alwaysLight
                        />
                        <Input
                            placeholder='Login'
                            value={form.login}
                            onChange={(e) => setForm({ ...form, login: e.target.value })}
                            required
                            alwaysLight
                            autoComplete='off'
                        />
                        <Input
                            type='password'
                            placeholder='Nova senha (deixe em branco para manter)'
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            alwaysLight
                            autoComplete='new-password'
                        />

                        {formErro && <Alert>{formErro}</Alert>}
                        {sucesso && <Alert variant='info'>{sucesso}</Alert>}

                        <div className='flex items-center justify-end gap-2 mt-2'>
                            <Button type='submit' disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                )}
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
