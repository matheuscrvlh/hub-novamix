import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import { getMe, getMySystems, updateMe, type Me, type UserSystem } from '../api/users.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
import Alert from '../components/Alert.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'
import { LogOut, Eye, EyeOff } from 'lucide-react'

type FormState = {
    name: string
    login: string
    password: string
}

const emptyForm: FormState = { name: '', login: '', password: '' }

function getInitials(name: string) {
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('')

    return initials || '?'
}

export default function Account() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()

    const [me, setMe] = useState<Me | null>(null)
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
            <header className='w-full bg-white dark:bg-dark-surface shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 px-4 py-2 sm:px-6'>
                <Logo compact />

                <div className='flex items-center gap-3 sm:gap-4'>
                    <button
                        type='button'
                        onClick={() => navigate(-1)}
                        className='text-xs sm:text-sm font-medium text-gray-text dark:text-dark-text hover:text-orange-base transition whitespace-nowrap'
                    >
                        ← Voltar
                    </button>
                    <Button
                        variant='ghost'
                        onClick={handleLogout}
                        aria-label='Sair'
                        title='Sair'
                        className='p-2 text-red-base hover:text-red-light hover:bg-red-base/10'
                    >
                        <LogOut size={18} />
                    </Button>
                </div>
            </header>

            <section className='flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-10'>
                <div className='flex items-center gap-4 mb-8'>
                    <div className='flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-orange-base text-white text-lg sm:text-xl font-semibold'>
                        {getInitials(me?.name ?? '')}
                    </div>
                    <div className='min-w-0'>
                        <h1 className='text-xl sm:text-2xl font-semibold text-gray-text dark:text-dark-text truncate'>
                            {me?.name || 'Minha conta'}
                        </h1>
                        <p className='text-sm text-gray-dark dark:text-dark-text-muted truncate'>
                            {me?.login ?? 'Atualize as informações da sua conta'}
                        </p>
                    </div>
                </div>

                {erro && (
                    <div className='mb-4'>
                        <Alert>{erro}</Alert>
                    </div>
                )}

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
                    <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6'>
                        <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted mb-4'>
                            Dados da conta
                        </h2>

                        {loading ? (
                            <p className='text-sm text-gray-dark dark:text-dark-text-muted'>Carregando...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
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
                    </div>

                    <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6'>
                        <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted mb-1'>
                            Meus sistemas
                        </h2>
                        <p className='text-xs text-gray-dark dark:text-dark-text-muted mb-4'>
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
                            <div className='flex flex-col gap-3 max-h-112 overflow-y-auto pr-1'>
                                {systems.map((system) => (
                                    <div
                                        key={system.system_id}
                                        className='rounded-lg border border-gray-base/20 dark:border-dark-border bg-gray/40 dark:bg-dark-surface-2 p-4'
                                    >
                                        <div className='flex items-center justify-between gap-2 mb-2'>
                                            <p className='min-w-0 truncate text-sm font-semibold text-gray-text dark:text-dark-text'>
                                                {system.system_name}
                                            </p>
                                            {system.link && (
                                                <a
                                                    href={system.link}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className='shrink-0 text-xs font-medium text-orange-base hover:underline'
                                                >
                                                    Acessar
                                                </a>
                                            )}
                                        </div>

                                        <div className='flex flex-col gap-1 text-sm text-gray-text dark:text-dark-text'>
                                            <p className='break-all'>
                                                <span className='text-gray-dark dark:text-dark-text-muted'>Login: </span>
                                                {system.user_login}
                                            </p>
                                            <p className='flex flex-wrap items-center gap-1.5'>
                                                <span className='text-gray-dark dark:text-dark-text-muted'>Senha: </span>
                                                <span className='break-all'>
                                                    {visiblePasswords.includes(system.system_id)
                                                        ? system.user_password
                                                        : '••••••••'}
                                                </span>
                                                <button
                                                    type='button'
                                                    onClick={() => togglePasswordVisibility(system.system_id)}
                                                    aria-label={visiblePasswords.includes(system.system_id) ? 'Ocultar senha' : 'Mostrar senha'}
                                                    title={visiblePasswords.includes(system.system_id) ? 'Ocultar senha' : 'Mostrar senha'}
                                                    className='text-orange-base hover:text-orange-light transition'
                                                >
                                                    {visiblePasswords.includes(system.system_id) ? (
                                                        <EyeOff size={14} />
                                                    ) : (
                                                        <Eye size={14} />
                                                    )}
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
