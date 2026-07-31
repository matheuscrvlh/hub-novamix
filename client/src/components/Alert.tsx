import type { ReactNode } from 'react'

type AlertProps = {
    children: ReactNode
    variant?: 'error' | 'info'
}

const variants = {
    error: 'bg-red-base/10 text-red-base border-red-base/20',
    info: 'bg-blue-base/10 text-blue-base border-blue-base/20'
}

export default function Alert({ children, variant = 'error' }: AlertProps) {
    return (
        <div className={`rounded-md border px-4 py-3 text-sm ${variants[variant]}`}>
            {children}
        </div>
    )
}
