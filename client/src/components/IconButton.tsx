import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactNode
    label: string
    variant: 'permission' | 'branch' | 'system' | 'edit' | 'danger'
    count?: number
}

const variants = {
    permission: 'bg-blue-base hover:bg-blue-base/85',
    branch: 'bg-gray-base hover:bg-gray-base/85',
    system: 'bg-gray-dark hover:bg-gray-dark/85',
    edit: 'bg-orange-base hover:bg-orange-light',
    danger: 'bg-red-base hover:bg-red-light'
}

export default function IconButton({ icon, label, variant, count, className = '', ...props }: IconButtonProps) {
    return (
        <button
            title={label}
            aria-label={label}
            className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base text-white shadow-sm transition disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {icon}
            {!!count && (
                <span className='absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-white px-1 text-[10px] font-semibold leading-none text-gray-text dark:border-dark-surface'>
                    {count}
                </span>
            )}
        </button>
    )
}
