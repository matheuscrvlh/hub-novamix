import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import { getChecklistNotifications, readChecklistNotification, type ChecklistNotification } from '../api/checklists.ts'
import { formatDateTime } from '../lib/date.ts'
import { ClipboardCheck, X } from 'lucide-react'

const POLL_INTERVAL = 30_000

export default function ChecklistNotifications() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState<ChecklistNotification[]>([])
    // evita que uma busca em andamento traga de volta o que acabou de ser fechado
    const dismissed = useRef(new Set<number>())

    useEffect(() => {
        if (!token) return

        function load() {
            if (document.hidden) return

            getChecklistNotifications(token)
                .then((result) => setNotifications(result.filter((n) => !dismissed.current.has(n.id))))
                .catch(() => {})
        }

        load()
        const interval = window.setInterval(load, POLL_INTERVAL)
        document.addEventListener('visibilitychange', load)

        return () => {
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', load)
        }
    }, [token])

    function dismiss(id: number) {
        dismissed.current.add(id)
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        readChecklistNotification(token, id).catch(() => {})
    }

    function open(id: number) {
        dismiss(id)
        navigate('/checklist')
    }

    if (notifications.length === 0) return null

    return (
        <div
            role='status'
            aria-live='polite'
            className='fixed left-4 top-4 z-40 flex w-[calc(100%-2rem)] max-w-sm max-h-[calc(100vh-2rem)] flex-col gap-2 overflow-y-auto'
        >
            {notifications.map((notification) => {
                const missing = notification.items.filter((item) => !item.received)

                return (
                    <div
                        key={notification.id}
                        className='rounded-xl border border-black/10 bg-white p-4 shadow-[0_12px_32px_-12px_rgba(16,24,40,0.35)] dark:bg-dark-surface dark:border-dark-border'
                    >
                        <div className='flex items-start gap-3'>
                            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-base/10 text-orange-base'>
                                <ClipboardCheck size={18} />
                            </span>

                            <div className='min-w-0 flex-1'>
                                <p className='text-sm font-semibold text-gray-text dark:text-dark-text'>
                                    Check-list enviado
                                </p>
                                <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                                    <span className='font-medium text-gray-text dark:text-dark-text'>{notification.user_name}</span>
                                    {' '}enviou o check-list de acessos.
                                </p>
                                <p className={`mt-1 text-xs font-medium ${missing.length === 0 ? 'text-green-base' : 'text-red-base'}`}>
                                    {missing.length === 0
                                        ? 'Recebeu todos os acessos.'
                                        : `Faltando: ${missing.map((item) => item.label).join(', ')}`}
                                </p>

                                <div className='mt-2 flex items-center justify-between gap-2'>
                                    <span className='text-xs text-gray-dark dark:text-dark-text-muted'>
                                        {formatDateTime(notification.created_at)}
                                    </span>
                                    <button
                                        type='button'
                                        onClick={() => open(notification.id)}
                                        className='text-xs font-medium text-orange-base hover:underline'
                                    >
                                        Ver check-lists
                                    </button>
                                </div>
                            </div>

                            <button
                                type='button'
                                onClick={() => dismiss(notification.id)}
                                aria-label='Fechar notificação'
                                title='Fechar'
                                className='rounded-md p-1 text-gray-dark transition hover:bg-gray dark:text-dark-text-muted dark:hover:bg-dark-surface-2'
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
