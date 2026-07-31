type FooterProps = {
    stacked?: boolean
    alwaysLight?: boolean
}

export default function Footer({ stacked = false, alwaysLight = false }: FooterProps) {
    const linkClassName = `font-medium text-gray-text transition hover:text-orange-base ${alwaysLight ? '' : 'dark:text-dark-text dark:hover:text-orange-light'}`
    const footerClassName = `text-center text-xs text-gray-dark ${alwaysLight ? '' : 'dark:text-dark-text-muted'}`

    const mthcode = (
        <a
            href='https://www.mthcode.com.br/'
            target='_blank'
            rel='noopener noreferrer'
            className={linkClassName}
        >
            MTHCODE
        </a>
    )

    const marlonAlves = (
        <a
            href='https://www.marlonalves.dev/'
            target='_blank'
            rel='noopener noreferrer'
            className={linkClassName}
        >
            MarlonAlves
        </a>
    )

    if (stacked) {
        return (
            <footer className={`space-y-1 pt-4 ${footerClassName}`}>
                <p>Desenvolvido por:</p>
                <p>{mthcode} e {marlonAlves}</p>
            </footer>
        )
    }

    return (
        <footer className={`pt-4 ${footerClassName}`}>
            Desenvolvido por {mthcode} e {marlonAlves}
        </footer>
    )
}
