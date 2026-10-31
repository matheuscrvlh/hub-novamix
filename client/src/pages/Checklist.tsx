import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import {
    getChecklists,
    getMyChecklist,
    sendChecklist,
    type ChecklistItem,
    type ChecklistSubmission
} from '../api/checklists.ts'
import { formatDateTime } from '../lib/date.ts'
import Button from '../components/Button.tsx'
import Alert from '../components/Alert.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'
import { Check, LogOut, X } from 'lucide-react'

function statusClassName(received: boolean) {
    return received ? 'bg-green-base/10 text-green-base' : 'bg-red-base/10 text-red-base'
}

export default function Checklist() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()

    const [items, setItems] = useState<ChecklistItem[]>([])
    const [observation, setObservation] = useState('')
    const [sentAt, setSentAt] = useState<string | null>(null)
    const [recipient, setRecipient] = useState(false)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [enviando, setEnviando] = useState(false)
    const [formErro, setFormErro] = useState('')
    const [sucesso, setSucesso] = useState('')

    const [submissions, setSubmissions] = useState<ChecklistSubmission[]>([])
    const [submissionsErro, setSubmissionsErro] = useState('')

    async function loadChecklist() {
        setLoading(true)
        setErro('')

        try {
            const result = await getMyChecklist(token)
            setItems(result.items)
            setObservation(result.observation)
            setSentAt(result.sent_at)
            setRecipient(result.recipient)

            if (result.recipient) {
                await loadSubmissions()
            }
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar check-list.')
        } finally {
            setLoading(false)
        }
    }

    async function loadSubmissions() {
        setSubmissionsErro('')

        try {
            const result = await getChecklists(token)
            setSubmissions(result)
        } catch (error) {
            setSubmissionsErro(error instanceof Error ? error.message : 'Erro ao buscar check-lists enviados.')
        }
    }

    useEffect(() => {
        loadChecklist()
    }, [])

    function toggleItem(key: string) {
        setSucesso('')
        setItems((prev) => prev.map((item) => (item.key === key ? { ...item, received: !item.received } : item)))
    }

    function handleLogout() {
        logout()
        navigate('/login')
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setEnviando(true)
        setFormErro('')
        setSucesso('')

        try {
            await sendChecklist(token, {
                items: items.map(({ key, received }) => ({ key, received })),
                observation
            })

            setSucesso('Check-list enviado! A equipe responsável já foi avisada.')
            setSentAt(new Date().toISOString())

            if (recipient) {
                await loadSubmissions()
            }
        } catch (error) {
            setFormErro(error instanceof Error ? error.message : 'Erro ao enviar check-list.')
        } finally {
            setEnviando(false)
        }
    }

    const receivedCount = items.filter((item) => item.received).length

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

            <section className={`flex-1 w-full mx-auto px-4 py-6 sm:px-6 sm:py-10 ${recipient ? 'max-w-4xl' : 'max-w-2xl'}`}>
                <h1 className='text-xl sm:text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                    Check-list de acessos
                </h1>
                <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-8'>
                    Marque os acessos que você já recebeu. O que ficar desmarcado será informado como pendente.
                </p>

                {erro && (
                    <div className='mb-4'>
                        <Alert>{erro}</Alert>
                    </div>
                )}

                <div className={`grid grid-cols-1 gap-6 items-start ${recipient ? 'lg:grid-cols-2' : ''}`}>
                    <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6'>
                        <div className='flex items-center justify-between gap-2 mb-4'>
                            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                                Seus acessos
                            </h2>
                            {!loading && (
                                <span className='text-xs text-gray-dark dark:text-dark-text-muted'>
                                    {receivedCount} de {items.length} recebidos
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <p className='text-sm text-gray-dark dark:text-dark-text-muted'>Carregando...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                                {items.map((item) => (
                                    <label
                                        key={item.key}
                                        className='flex cursor-pointer items-center gap-3 rounded-lg border border-gray-base/20 dark:border-dark-border px-4 py-3 transition hover:bg-gray/60 dark:hover:bg-dark-surface-2'
                                    >
                                        <input
                                            type='checkbox'
                                            checked={item.received}
                                            onChange={() => toggleItem(item.key)}
                                            className='h-4 w-4 shrink-0 cursor-pointer accent-orange-base'
                                        />
                                        <span className='min-w-0 flex-1 text-sm font-medium text-gray-text dark:text-dark-text'>
                                            {item.label}
                                        </span>
                                        <span className={`shrink-0 rounded-full text-xs font-medium px-2 py-1 ${statusClassName(item.received)}`}>
                                            {item.received ? 'Recebido' : 'Faltando'}
                                        </span>
                                    </label>
                                ))}

                                <textarea
                                    placeholder='Observações (opcional)'
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    className='mt-1 w-full resize-y rounded-md border border-gray-base bg-white px-3 py-2 text-sm text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base dark:border-dark-border dark:bg-dark-surface-2 dark:text-dark-text'
                                />

                                {formErro && <Alert>{formErro}</Alert>}
                                {sucesso && <Alert variant='info'>{sucesso}</Alert>}

                                <div className='flex flex-wrap items-center justify-between gap-2 mt-2'>
                                    <p className='text-xs text-gray-dark dark:text-dark-text-muted'>
                                        {sentAt ? `Último envio: ${formatDateTime(sentAt)}` : 'Você ainda não enviou o check-list.'}
                                    </p>
                                    <Button type='submit' disabled={enviando}>
                                        {enviando ? 'Enviando...' : sentAt ? 'Enviar novamente' : 'Enviar check-list'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {recipient && (
                        <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6'>
                            <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted mb-1'>
                                Check-lists recebidos
                            </h2>
                            <p className='text-xs text-gray-dark dark:text-dark-text-muted mb-4'>
                                Envios dos funcionários, do mais recente para o mais antigo.
                            </p>

                            {submissionsErro && (
                                <div className='mb-4'>
                                    <Alert>{submissionsErro}</Alert>
                                </div>
                            )}

                            {submissions.length === 0 ? (
                                <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                                    Nenhum check-list enviado ainda.
                                </p>
                            ) : (
                                <div className='flex flex-col gap-3 max-h-144 overflow-y-auto pr-1'>
                                    {submissions.map((submission) => (
                                        <div
                                            key={submission.id}
                                            className='rounded-lg border border-gray-base/20 dark:border-dark-border bg-gray/40 dark:bg-dark-surface-2 p-4'
                                        >
                                            <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'>
                                                <p className='min-w-0 truncate text-sm font-semibold text-gray-text dark:text-dark-text'>
                                                    {submission.user_name}
                                                </p>
                                                <p className='shrink-0 text-xs text-gray-dark dark:text-dark-text-muted'>
                                                    {formatDateTime(submission.created_at)}
                                                </p>
                                            </div>
                                            <p className='truncate text-xs text-gray-dark dark:text-dark-text-muted'>
                                                {submission.user_login}
                                                {submission.sector_name ? ` · ${submission.sector_name}` : ''}
                                            </p>

                                            <div className='mt-3 flex flex-wrap gap-1.5'>
                                                {submission.items.map((item) => (
                                                    <span
                                                        key={item.key}
                                                        className={`inline-flex items-center gap-1 rounded-full text-xs font-medium px-2 py-1 ${statusClassName(item.received)}`}
                                                    >
                                                        {item.received ? <Check size={12} /> : <X size={12} />}
                                                        {item.label}
                                                    </span>
                                                ))}
                                            </div>

                                            {submission.observation && (
                                                <p className='mt-3 whitespace-pre-line wrap-break-word text-sm text-gray-text dark:text-dark-text'>
                                                    {submission.observation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <div className='pb-6'>
                <Footer />
            </div>
        </main>
    )
}
