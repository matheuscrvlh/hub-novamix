import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'danger' | 'ghost'
}

const variants = {
    primary: 'bg-orange-base text-white hover:bg-orange-light',
    danger: 'bg-red-light text-white hover:bg-red-base',
    ghost: 'bg-transparent text-gray-text hover:bg-gray dark:text-dark-text dark:hover:bg-dark-surface-2'
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
