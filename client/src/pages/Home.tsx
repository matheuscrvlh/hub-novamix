import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import Button from '../components/Button.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'

function moduleLabel(slug: string) {
    return slug
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export default function Home() {
    const { role, permissions, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    const isAdmin = role === 'admin'
    const hasContent = isAdmin || permissions.length > 0

    return (
        <main className='w-full min-h-screen bg-gray dark:bg-dark-bg flex flex-col'>
            <header className='w-full bg-white dark:bg-dark-surface shadow-sm flex items-center justify-between px-6'>
                <Logo compact />

                <div className='flex items-center gap-4'>
                    {role && (
                        <span className='hidden sm:inline text-sm font-medium text-gray-text dark:text-dark-text'>
                            {role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                    )}
                    <Button variant='ghost' onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            </header>

            <section className='flex-1 w-full max-w-5xl mx-auto px-6 py-10'>
                <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                    Bem-vindo ao Hub Novamix
                </h1>
                <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-8'>
                    Selecione um sistema abaixo para acessar.
                </p>

                {!hasContent ? (
                    <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-8 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhum sistema liberado para o seu usuário ainda. Fale com um administrador.
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {isAdmin && (
                            <Link
                                to='/users'
                                className='group flex flex-col gap-3 rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5'
                            >
                                <div className='flex items-center justify-between'>
                                    <span className='text-base font-semibold text-gray-text dark:text-dark-text'>
                                        Usuários
                                    </span>
                                    <span className='rounded-full bg-blue-base/10 text-blue-base text-xs font-medium px-2 py-1'>
                                        admin
                                    </span>
                                </div>
                                <span className='text-sm text-gray-dark dark:text-dark-text-muted group-hover:text-orange-base transition'>
                                    Gerenciar usuários →
                                </span>
                            </Link>
                        )}

                        {permissions.map((permission) => (
                            <a
                                key={permission.module}
                                href={`https://${permission.module}.lojanovamix.com.br`}
                                className='group flex flex-col gap-3 rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5'
                            >
                                <div className='flex items-center justify-between'>
                                    <span className='text-base font-semibold text-gray-text dark:text-dark-text'>
                                        {moduleLabel(permission.module)}
                                    </span>
                                    <span className='rounded-full bg-orange-base/10 text-orange-base text-xs font-medium px-2 py-1'>
                                        {permission.access}
                                    </span>
                                </div>
                                <span className='text-sm text-gray-dark dark:text-dark-text-muted group-hover:text-orange-base transition'>
                                    Acessar sistema →
                                </span>
                            </a>
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
