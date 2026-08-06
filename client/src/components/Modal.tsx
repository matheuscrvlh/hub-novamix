import type { ReactNode } from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    maxWidthClassName?: string
}

export default function Modal({ open, onClose, title, children, maxWidthClassName = 'max-w-md' }: ModalProps) {
    if (!open) return null

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'
            onClick={onClose}
        >
            <div
                className={`w-full ${maxWidthClassName} rounded-xl bg-white dark:bg-dark-surface p-6 shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mb-4'>{title}</h2>
                {children}
            </div>
        </div>
    )
}
