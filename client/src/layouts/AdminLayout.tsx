import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import Button from '../components/Button.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'
import { LogOut } from 'lucide-react'

const tabs = [
    { to: 'users', label: 'Usuários' },
    { to: 'branchs', label: 'Filiais' },
    { to: 'sectors', label: 'Setores' },
    { to: 'modules', label: 'Módulos' },
    { to: 'systems', label: 'Sistemas' }
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
            <header className='w-full bg-white dark:bg-dark-surface shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 px-4 py-2 sm:px-6'>
                <Logo compact />

                <div className='flex items-center gap-3 sm:gap-4'>
                    <Link
                        to='/home'
                        className='text-xs sm:text-sm font-medium text-gray-text dark:text-dark-text hover:text-orange-base transition whitespace-nowrap'
                    >
                        ← Voltar
                    </Link>
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

            <nav className='w-full bg-white dark:bg-dark-surface border-t border-gray-base/20 dark:border-dark-border px-4 sm:px-6 flex gap-4 sm:gap-6 overflow-x-auto'>
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            `py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
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

            <section className='flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-10'>
                <Outlet />
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
