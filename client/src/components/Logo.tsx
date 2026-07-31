import logoNm from '../assets/logos/logo-nm.jpeg'

type LogoProps = {
    compact?: boolean
}

export default function Logo({ compact = false }: LogoProps) {
    return (
        <div className={`flex items-center justify-center ${compact ? '' : 'px-6 py-6'}`}>
            <img
                src={logoNm}
                alt='Logo Novamix'
                className={`rounded-lg bg-white dark:p-1.5 ${compact ? 'h-12 w-auto' : 'w-[70%] max-w-48'}`}
            />
        </div>
    )
}
