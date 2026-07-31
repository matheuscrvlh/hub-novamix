import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import { createUser, deleteUser, getUsers, updateUser, type User, type UserPayload } from '../api/users.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
import Alert from '../components/Alert.tsx'
import Modal from '../components/Modal.tsx'
import Logo from '../components/Logo.tsx'
import Footer from '../components/Footer.tsx'

type FormState = {
    name: string
    login: string
    password: string
    role: UserPayload['role']
    status: boolean
}

const emptyForm: FormState = { name: '', login: '', password: '', role: 'user', status: true }

export default function Users() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [salvando, setSalvando] = useState(false)
    const [formErro, setFormErro] = useState('')

    async function loadUsers() {
        setLoading(true)
        setErro('')

        try {
            const result = await getUsers(token)
            setUsers(result)
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar usuários.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    function handleLogout() {
        logout()
        navigate('/login')
    }

    function openCreateModal() {
        setEditingId(null)
        setForm(emptyForm)
        setFormErro('')
        setModalOpen(true)
    }

    function openEditModal(user: User) {
        setEditingId(user.id)
        setForm({ name: user.name, login: user.login, password: '', role: user.role, status: user.status })
        setFormErro('')
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setSalvando(true)
        setFormErro('')

        const payload: UserPayload = {
            name: form.name,
            login: form.login,
            role: form.role,
            status: form.status,
            ...(form.password ? { password: form.password } : {})
        }

        try {
            if (editingId) {
                await updateUser(token, editingId, payload)
            } else {
                await createUser(token, payload)
            }

            setModalOpen(false)
            await loadUsers()
        } catch (error) {
            setFormErro(error instanceof Error ? error.message : 'Erro ao salvar usuário.')
        } finally {
            setSalvando(false)
        }
    }

    async function handleDelete(user: User) {
        if (!window.confirm(`Excluir o usuário ${user.name}?`)) {
            return
        }

        try {
            await deleteUser(token, user.id)
            await loadUsers()
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao excluir usuário.')
        }
    }

    return (
        <main className='w-full min-h-screen bg-gray dark:bg-dark-bg flex flex-col'>
            <header className='w-full bg-white dark:bg-dark-surface shadow-sm flex items-center justify-between px-6'>
                <Logo compact />

                <div className='flex items-center gap-4'>
                    <Link
                        to='/home'
                        className='text-sm font-medium text-gray-text dark:text-dark-text hover:text-orange-base transition'
                    >
                        ← Voltar
                    </Link>
                    <Button variant='ghost' onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
            </header>

            <section className='flex-1 w-full max-w-5xl mx-auto px-6 py-10'>
                <div className='flex items-center justify-between mb-6 gap-4'>
                    <div>
                        <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                            Usuários
                        </h1>
                        <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                            Gerencie os usuários com acesso ao hub.
                        </p>
                    </div>

                    <Button onClick={openCreateModal}>Novo usuário</Button>
                </div>

                {erro && (
                    <div className='mb-4'>
                        <Alert>{erro}</Alert>
                    </div>
                )}

                <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                        <thead>
                            <tr className='border-b border-gray-base/30 dark:border-dark-border text-gray-dark dark:text-dark-text-muted'>
                                <th className='px-4 py-3 font-medium'>Nome</th>
                                <th className='px-4 py-3 font-medium'>Login</th>
                                <th className='px-4 py-3 font-medium'>Perfil</th>
                                <th className='px-4 py-3 font-medium'>Status</th>
                                <th className='px-4 py-3 font-medium text-right'>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                        Carregando...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                        Nenhum usuário cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className='border-b last:border-0 border-gray-base/20 dark:border-dark-border text-gray-text dark:text-dark-text'
                                    >
                                        <td className='px-4 py-3'>{user.name}</td>
                                        <td className='px-4 py-3'>{user.login}</td>
                                        <td className='px-4 py-3 capitalize'>{user.role}</td>
                                        <td className='px-4 py-3'>
                                            <span
                                                className={`rounded-full text-xs font-medium px-2 py-1 ${
                                                    user.status
                                                        ? 'bg-green-base/10 text-green-base'
                                                        : 'bg-red-base/10 text-red-base'
                                                }`}
                                            >
                                                {user.status ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <Button variant='ghost' onClick={() => openEditModal(user)}>
                                                    Editar
                                                </Button>
                                                <Button variant='danger' onClick={() => handleDelete(user)}>
                                                    Excluir
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className='pb-6'>
                <Footer />
            </div>

            <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar usuário' : 'Novo usuário'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input
                        placeholder='Nome'
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        alwaysLight
                    />
                    <Input
                        placeholder='Login'
                        value={form.login}
                        onChange={(e) => setForm({ ...form, login: e.target.value })}
                        required
                        alwaysLight
                    />
                    <Input
                        type='password'
                        placeholder={editingId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required={!editingId}
                        alwaysLight
                    />

                    <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as UserPayload['role'] })}
                        className='w-full rounded-md border border-gray-base bg-white px-3 py-2 text-sm text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base'
                    >
                        <option value='user'>Usuário</option>
                        <option value='admin'>Administrador</option>
                    </select>

                    <label className='flex items-center gap-2 text-sm text-gray-text'>
                        <input
                            type='checkbox'
                            checked={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.checked })}
                        />
                        Usuário ativo
                    </label>

                    {formErro && <Alert>{formErro}</Alert>}

                    <div className='flex items-center justify-end gap-2 mt-2'>
                        <Button type='button' variant='ghost' onClick={closeModal}>
                            Cancelar
                        </Button>
                        <Button type='submit' disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </main>
    )
}
