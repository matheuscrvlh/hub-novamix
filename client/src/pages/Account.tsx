import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import { getMe, getMySystems, updateMe, type Me, type UserSystem } from '../api/users.ts'
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

    const [systems, setSystems] = useState<UserSystem[]>([])
    const [systemsLoading, setSystemsLoading] = useState(true)
    const [systemsErro, setSystemsErro] = useState('')
    const [visiblePasswords, setVisiblePasswords] = useState<number[]>([])

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

    async function loadSystems() {
        setSystemsLoading(true)
        setSystemsErro('')

        try {
            const result = await getMySystems(token)
            setSystems(result)
        } catch (error) {
            setSystemsErro(error instanceof Error ? error.message : 'Erro ao buscar sistemas.')
        } finally {
            setSystemsLoading(false)
        }
    }

    useEffect(() => {
        loadMe()
        loadSystems()
    }, [])

    function togglePasswordVisibility(systemId: number) {
        setVisiblePasswords((prev) =>
            prev.includes(systemId) ? prev.filter((id) => id !== systemId) : [...prev, systemId]
        )
    }

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

            <section className='w-full max-w-2xl mx-auto px-6 pb-10'>
                <h2 className='text-xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                    Meus sistemas
                </h2>
                <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-4'>
                    Login e senha cadastrados para você em cada sistema.
                </p>

                {systemsErro && (
                    <div className='mb-4'>
                        <Alert>{systemsErro}</Alert>
                    </div>
                )}

                {systemsLoading ? (
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>Carregando...</p>
                ) : systems.length === 0 ? (
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhum sistema vinculado à sua conta.
                    </p>
                ) : (
                    <div className='flex flex-col gap-3'>
                        {systems.map((system) => (
                            <div
                                key={system.system_id}
                                className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-4'
                            >
                                <div className='flex items-center justify-between mb-2'>
                                    <p className='text-sm font-semibold text-gray-text dark:text-dark-text'>
                                        {system.system_name}
                                    </p>
                                    {system.link && (
                                        <a
                                            href={system.link}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='text-xs font-medium text-orange-base hover:underline'
                                        >
                                            Acessar
                                        </a>
                                    )}
                                </div>

                                <div className='flex flex-col gap-1 text-sm text-gray-text dark:text-dark-text'>
                                    <p>
                                        <span className='text-gray-dark dark:text-dark-text-muted'>Login: </span>
                                        {system.user_login}
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <span className='text-gray-dark dark:text-dark-text-muted'>Senha: </span>
                                        <span>
                                            {visiblePasswords.includes(system.system_id)
                                                ? system.user_password
                                                : '••••••••'}
                                        </span>
                                        <button
                                            type='button'
                                            onClick={() => togglePasswordVisibility(system.system_id)}
                                            className='text-xs font-medium text-orange-base hover:underline'
                                        >
                                            {visiblePasswords.includes(system.system_id) ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
