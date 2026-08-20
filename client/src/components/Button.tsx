import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'danger' | 'ghost' | 'permission' | 'branch' | 'system' | 'edit'
}

const variants = {
    primary: 'bg-orange-base text-white hover:bg-orange-light',
    danger: 'bg-red-base/10 text-red-base border border-red-base/20 hover:bg-red-base/20',
    ghost: 'bg-transparent text-gray-text hover:bg-gray dark:text-dark-text dark:hover:bg-dark-surface-2',
    permission: 'bg-blue-base/10 text-blue-base border border-blue-base/20 hover:bg-blue-base/20',
    branch: 'bg-gray-base/10 text-gray-base border border-gray-base/20 hover:bg-gray-base/20',
    system: 'bg-orange-base/10 text-orange-base border border-orange-base/20 hover:bg-orange-base/20',
    edit: 'bg-gray-dark/10 text-gray-dark border border-gray-dark/20 hover:bg-gray-dark/20 dark:text-dark-text dark:border-dark-border dark:hover:bg-dark-surface-2'
}

export default function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
    return (
        <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
