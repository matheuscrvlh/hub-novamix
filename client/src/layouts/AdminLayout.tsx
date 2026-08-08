import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import Button from '../components/Button.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'

const tabs = [
    { to: 'users', label: 'Usuários' },
    { to: 'branchs', label: 'Filiais' },
    { to: 'modules', label: 'Módulos' }
]

export default function AdminLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <main className='w-full min-h-screen bg-gray dark:bg-dark-bg flex flex-col'>
            <header className='w-full bg-white dark:bg-dark-surface shadow-sm flex items-center justify-between px-6'>
                <Logo compact />

                <div className='flex items-center gap-4'>
                    <Link
                        to='/home'
                        className='text-sm font-medium text-gray-text dark:text-dark-text hover:text-orange-base transition'
                    >
                        ← Voltar
                    </Link>
                    <Link
                        to='/account'
                        className='text-sm font-medium text-gray-text dark:text-dark-text hover:text-orange-base transition'
                    >
                        Minha conta
                    </Link>
                    <Button variant='ghost' onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            </header>

            <nav className='w-full bg-white dark:bg-dark-surface border-t border-gray-base/20 dark:border-dark-border px-6 flex gap-6'>
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            `py-3 text-sm font-medium border-b-2 transition ${
                                isActive
                                    ? 'border-orange-base text-orange-base'
                                    : 'border-transparent text-gray-dark dark:text-dark-text-muted hover:text-orange-base'
                            }`
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>

            <section className='flex-1 w-full max-w-5xl mx-auto px-6 py-10'>
                <Outlet />
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
