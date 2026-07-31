import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/auth.ts'
import { useAuth } from '../hooks/useAuth.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
import Alert from '../components/Alert.tsx'
import Footer from '../components/Footer.tsx'
import bannerLogin from '../assets/banners/bannerLogin.jpeg'
import logoNm from '../assets/logos/logo-nm.jpeg'

export default function Login() {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)
    const { login: authLogin } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setErro('')
        setEnviando(true)

        try {
            const result = await auth({ user, password })
            authLogin(result.token)
            navigate('/home')
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao efetuar login.')
            setEnviando(false)
        }
    }

    return (
        <main className='w-full min-h-screen flex relative overflow-hidden'>
            <img
                src={bannerLogin}
                alt='Banner Novamix'
                className='absolute inset-0 w-full h-full object-cover'
            />

            <form
                onSubmit={handleSubmit}
                className='bg-white w-[90%] max-w-95 mx-auto my-auto flex flex-col gap-3 p-6
                           justify-center rounded-xl shadow-2xl relative z-10
                           md:w-105 md:max-w-105 md:absolute md:right-[8%]
                           md:top-1/2 md:-translate-y-1/2 md:mx-0
                           lg:right-[10%]'
            >
                <img src={logoNm} alt='Logo Novamix' className='w-[45%] max-w-35 mx-auto mb-3' />

                <Input
                    placeholder='Login'
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                    alwaysLight
                />
                <Input
                    type='password'
                    placeholder='Senha'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    alwaysLight
                />

                {erro && <Alert>{erro}</Alert>}

                <Button type='submit' className='w-full mt-2' disabled={enviando}>
                    {enviando ? 'Entrando...' : 'Entrar'}
                </Button>

                <Footer stacked alwaysLight />
            </form>
        </main>
    )
}
