type SwitchProps = {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
}

export default function Switch({ checked, onChange, label }: SwitchProps) {
    return (
        <label className='flex items-center justify-between gap-3 rounded-lg border border-gray-base/30 dark:border-dark-border px-3 py-2.5 cursor-pointer'>
            <span className='text-sm font-medium text-gray-text dark:text-dark-text'>{label}</span>
            <button
                type='button'
                role='switch'
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                    checked ? 'bg-green-base' : 'bg-gray-base/25 dark:bg-dark-surface-2'
                }`}
            >
                <span
                    className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                />
            </button>
        </label>
    )
}
