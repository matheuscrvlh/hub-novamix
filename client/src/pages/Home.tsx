import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import { getModules, type Module } from '../api/modules.ts'
import { getMe } from '../api/users.ts'
import Button from '../components/Button.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'
import {
    AppWindow,
    ArrowUpRight,
    Briefcase,
    ChefHat,
    ClipboardCheck,
    ClipboardList,
    Headset,
    History,
    LogOut,
    Monitor,
    Package,
    Search,
    Settings,
    ShoppingCart,
    Star,
    Wallet,
    Wrench,
    X,
    type LucideIcon
} from 'lucide-react'

type HubSystem = {
    slug: string
    name: string
    href: string
    publicHref: string | null
}

type RecentEntry = {
    slug: string
    area: 'gestao' | 'cliente'
}

type Tone = 'teal' | 'orange' | 'blue' | 'slate' | 'red' | 'sky' | 'bronze'

const toneClasses: Record<Tone, string> = {
    teal: 'bg-gray-base/10 text-gray-base',
    orange: 'bg-orange-base/10 text-orange-base',
    blue: 'bg-blue-base/10 text-blue-base dark:text-silver',
    slate: 'bg-gray-dark/10 text-gray-dark dark:text-dark-text',
    red: 'bg-red-base/10 text-red-base',
    sky: 'bg-silver/15 text-silver',
    bronze: 'bg-bronze/10 text-bronze'
}

const fallbackTones: Tone[] = ['teal', 'orange', 'blue', 'slate', 'red', 'sky', 'bronze']

const systemIcons: { match: RegExp; icon: LucideIcon; tone: Tone }[] = [
    { match: /financ/, icon: Wallet, tone: 'teal' },
    { match: /ecommerce|e-commerce/, icon: ShoppingCart, tone: 'orange' },
    { match: /avalia/, icon: Star, tone: 'bronze' },
    { match: /curso|culinar/, icon: ChefHat, tone: 'red' },
    { match: /consumo/, icon: Package, tone: 'blue' },
    { match: /tecnologia|\bti\b/, icon: Monitor, tone: 'slate' },
    { match: /\bpops?\b/, icon: ClipboardList, tone: 'sky' },
    { match: /televenda/, icon: Headset, tone: 'teal' },
    { match: /comercial/, icon: Briefcase, tone: 'blue' },
    { match: /ordem|servico/, icon: Wrench, tone: 'slate' }
]

const RECENT_KEY = 'hub:recent'
const RECENT_LIMIT = 4

function moduleLabel(slug: string) {
    return slug
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function normalize(text: string) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
}

function hostname(link: string) {
    try {
        return new URL(link).hostname.replace(/^www\./, '')
    } catch {
        return link
    }
}

function greeting() {
    const hour = new Date().getHours()

    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
}

function todayLabel() {
    const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
    return label.charAt(0).toUpperCase() + label.slice(1)
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.charAt(0) ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
    return (first + last).toUpperCase()
}

function readRecent(): RecentEntry[] {
    try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
        return Array.isArray(stored) ? stored.filter((entry) => typeof entry?.slug === 'string') : []
    } catch {
        return []
    }
}

function writeRecent(entries: RecentEntry[]) {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(entries))
    } catch {
        // sem localStorage (aba anônima, etc.) o hub só não lembra os recentes
    }
}

function systemVisual(system: HubSystem) {
    const text = normalize(`${system.slug} ${system.name}`)
    const known = systemIcons.find((entry) => entry.match.test(text))

    if (known) {
        return known
    }

    const hash = [...system.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return { icon: AppWindow, tone: fallbackTones[hash % fallbackTones.length] }
}

function SystemIcon({ system, size = 'md' }: { system: HubSystem; size?: 'sm' | 'md' }) {
    const { icon: Icon, tone } = systemVisual(system)
    const box = size === 'md' ? 'h-11 w-11 rounded-xl' : 'h-9 w-9 rounded-lg'

    return (
        <span className={`flex shrink-0 items-center justify-center ${box} ${toneClasses[tone]}`}>
            <Icon size={size === 'md' ? 22 : 18} strokeWidth={1.75} />
        </span>
    )
}

type SystemCardProps = {
    system: HubSystem
    onOpen: (entry: RecentEntry) => void
}

function SystemCard({ system, onOpen }: SystemCardProps) {
    const cardClassName = 'group relative flex flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-black/10 hover:shadow-[0_12px_32px_-16px_rgba(16,24,40,0.25)] dark:bg-dark-surface dark:border-dark-border dark:hover:border-dark-text-muted/40'

    const header = (
        <div className='flex items-center gap-4'>
            <SystemIcon system={system} />
            <div className='min-w-0 flex-1'>
                <h3 className='truncate text-[15px] font-semibold text-gray-text dark:text-dark-text'>
                    {system.name}
                </h3>
                <p className='truncate text-xs text-gray-dark dark:text-dark-text-muted'>
                    {hostname(system.href)}
                </p>
            </div>
        </div>
    )

    if (!system.publicHref) {
        return (
            <div className={`${cardClassName} hover:-translate-y-0.5`}>
                {header}
                <a
                    href={system.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => onOpen({ slug: system.slug, area: 'gestao' })}
                    className='mt-5 inline-flex items-center gap-1 text-sm font-medium text-gray-dark transition group-hover:text-orange-base dark:text-dark-text-muted after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-orange-base'
                >
                    Abrir sistema
                    <ArrowUpRight size={16} className='transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                </a>
            </div>
        )
    }

    return (
        <div className={cardClassName}>
            {header}
            <div className='mt-5 grid grid-cols-2 gap-2'>
                <a
                    href={system.publicHref}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => onOpen({ slug: system.slug, area: 'cliente' })}
                    className='rounded-lg border border-black/10 px-3 py-2 text-center text-sm font-medium text-gray-text transition hover:bg-gray dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface-2'
                >
                    Cliente
                </a>
                <a
                    href={system.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => onOpen({ slug: system.slug, area: 'gestao' })}
                    className='rounded-lg bg-orange-base px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-orange-light'
                >
                    Gestão
                </a>
            </div>
        </div>
    )
}

export default function Home() {
    const { token, role, permissions, logout } = useAuth()
    const navigate = useNavigate()
    const [modules, setModules] = useState<Module[]>([])
    const [name, setName] = useState('')
    const [query, setQuery] = useState('')
    const [recent, setRecent] = useState<RecentEntry[]>(readRecent)
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!token) return
        getModules(token).then(setModules).catch(() => {})
        getMe(token).then((me) => setName(me.name)).catch(() => {})
    }, [token])

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement
            const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

            if (e.key === '/' && !typing) {
                e.preventDefault()
                searchRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const systems = useMemo<HubSystem[]>(() => {
        return permissions
            .map((permission) => {
                const module = modules.find((m) => m.slug === permission.module)
                const hasSeparateLinks = !!module && module.public_link !== module.private_link

                return {
                    slug: permission.module,
                    name: module?.name ?? moduleLabel(permission.module),
                    href: module?.private_link ?? `https://${permission.module}.lojanovamix.com.br`,
                    publicHref: hasSeparateLinks ? module.public_link : null
                }
            })
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    }, [permissions, modules])

    const filteredSystems = useMemo(() => {
        const term = normalize(query.trim())
        if (!term) return systems
        return systems.filter((system) => normalize(`${system.name} ${system.slug}`).includes(term))
    }, [systems, query])

    const recentSystems = recent
        .map((entry) => ({ entry, system: systems.find((s) => s.slug === entry.slug) }))
        .filter((item): item is { entry: RecentEntry; system: HubSystem } => !!item.system)

    function handleOpen(entry: RecentEntry) {
        const next = [entry, ...recent.filter((r) => r.slug !== entry.slug || r.area !== entry.area)].slice(0, RECENT_LIMIT)
        setRecent(next)
        writeRecent(next)
    }

    function handleLogout() {
        logout()
        navigate('/login')
    }

    const isAdmin = role === 'admin'
    const firstName = name.trim().split(/\s+/)[0]
    const showRecent = !query && recentSystems.length > 0

    return (
        <main className='w-full min-h-screen bg-gray dark:bg-dark-bg flex flex-col'>
            <header className='sticky top-0 z-10 w-full border-b border-black/5 bg-white/85 backdrop-blur dark:bg-dark-surface/85 dark:border-dark-border'>
                <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
                    <div className='flex items-center gap-3'>
                        <Logo compact />
                        <span className='hidden sm:block border-l border-black/10 pl-3 text-sm font-semibold text-gray-text dark:border-dark-border dark:text-dark-text'>
                            Hub
                        </span>
                    </div>

                    <div className='flex items-center gap-1 sm:gap-2'>
                        {isAdmin && (
                            <Link
                                to='/admin'
                                title='Administração'
                                className='flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-text transition hover:bg-gray dark:text-dark-text dark:hover:bg-dark-surface-2'
                            >
                                <Settings size={18} />
                                <span className='hidden md:inline'>Administração</span>
                            </Link>
                        )}

                        <Link
                            to='/checklist'
                            title='Check-list de acessos'
                            className='flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-text transition hover:bg-gray dark:text-dark-text dark:hover:bg-dark-surface-2'
                        >
                            <ClipboardCheck size={18} />
                            <span className='hidden md:inline'>Check-list</span>
                        </Link>

                        <Link
                            to='/account'
                            title='Minha conta'
                            className='flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray dark:hover:bg-dark-surface-2'
                        >
                            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-base text-xs font-semibold text-white'>
                                {name ? initials(name) : '…'}
                            </span>
                            {name && (
                                <span className='hidden sm:inline text-sm font-medium text-gray-text dark:text-dark-text'>
                                    {name}
                                </span>
                            )}
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
                </div>
            </header>

            <section className='flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12'>
                <p className='text-sm font-medium text-gray-dark dark:text-dark-text-muted'>
                    {todayLabel()}
                </p>
                <h1 className='mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-text dark:text-dark-text'>
                    {firstName ? `${greeting()}, ${firstName}` : 'Bem-vindo ao Hub Novamix'}
                </h1>
                <p className='mt-2 text-base text-gray-dark dark:text-dark-text-muted'>
                    Todos os sistemas da Novamix em um só lugar.
                </p>

                {systems.length === 0 ? (
                    <div className='mt-10 rounded-2xl border border-black/5 bg-white p-10 text-center dark:bg-dark-surface dark:border-dark-border'>
                        <AppWindow size={28} className='mx-auto mb-3 text-gray-dark dark:text-dark-text-muted' />
                        <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                            Nenhum sistema liberado para o seu usuário ainda. Fale com um administrador.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className='relative mt-8 max-w-xl'>
                            <Search size={18} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-dark dark:text-dark-text-muted' />
                            <input
                                ref={searchRef}
                                type='search'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
                                placeholder='Buscar sistema'
                                aria-label='Buscar sistema'
                                className='w-full rounded-xl border border-black/10 bg-white py-3 pl-11 pr-12 text-sm text-gray-text shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition placeholder:text-gray-dark/70 focus:border-orange-base focus:ring-4 focus:ring-orange-base/15 dark:bg-dark-surface dark:border-dark-border dark:text-dark-text [&::-webkit-search-cancel-button]:hidden'
                            />
                            {query ? (
                                <button
                                    type='button'
                                    onClick={() => setQuery('')}
                                    aria-label='Limpar busca'
                                    className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-dark transition hover:bg-gray dark:text-dark-text-muted dark:hover:bg-dark-surface-2'
                                >
                                    <X size={16} />
                                </button>
                            ) : (
                                <kbd className='pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-black/10 px-1.5 py-0.5 font-sans text-xs text-gray-dark sm:block dark:border-dark-border dark:text-dark-text-muted'>
                                    /
                                </kbd>
                            )}
                        </div>

                        {showRecent && (
                            <div className='mt-10'>
                                <h2 className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-text dark:text-dark-text'>
                                    <History size={16} className='text-gray-dark dark:text-dark-text-muted' />
                                    Acessados recentemente
                                </h2>
                                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                                    {recentSystems.map(({ entry, system }) => (
                                        <a
                                            key={`${entry.slug}-${entry.area}`}
                                            href={entry.area === 'cliente' && system.publicHref ? system.publicHref : system.href}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            onClick={() => handleOpen(entry)}
                                            className='flex items-center gap-3 rounded-xl border border-black/5 bg-white px-3 py-2.5 transition hover:border-black/10 hover:shadow-[0_8px_24px_-16px_rgba(16,24,40,0.25)] dark:bg-dark-surface dark:border-dark-border'
                                        >
                                            <SystemIcon system={system} size='sm' />
                                            <span className='min-w-0'>
                                                <span className='block truncate text-sm font-medium text-gray-text dark:text-dark-text'>
                                                    {system.name}
                                                </span>
                                                {system.publicHref && (
                                                    <span className='block text-xs text-gray-dark dark:text-dark-text-muted'>
                                                        {entry.area === 'cliente' ? 'Cliente' : 'Gestão'}
                                                    </span>
                                                )}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='mt-10'>
                            <h2 className='mb-3 text-sm font-semibold text-gray-text dark:text-dark-text'>
                                {query ? 'Resultados' : 'Seus sistemas'}
                                <span className='ml-2 font-normal text-gray-dark dark:text-dark-text-muted'>
                                    {filteredSystems.length}
                                </span>
                            </h2>

                            {filteredSystems.length === 0 ? (
                                <div className='rounded-2xl border border-dashed border-black/10 p-10 text-center text-sm text-gray-dark dark:border-dark-border dark:text-dark-text-muted'>
                                    Nenhum sistema encontrado para “{query}”.
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                    {filteredSystems.map((system) => (
                                        <SystemCard key={system.slug} system={system} onOpen={handleOpen} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
