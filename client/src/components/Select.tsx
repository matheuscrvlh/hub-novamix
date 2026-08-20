import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    alwaysLight?: boolean
}

export default function Select({ className = '', alwaysLight = false, children, ...props }: SelectProps) {
    return (
        <select
            className={`rounded-md border border-gray-base bg-white px-3 py-2 text-sm text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base disabled:opacity-50 ${alwaysLight ? '' : 'dark:border-dark-border dark:bg-dark-surface-2 dark:text-dark-text'} ${className}`}
            {...props}
        >
            {children}
        </select>
    )
}
