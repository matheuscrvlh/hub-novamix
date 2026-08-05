import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createUser, deleteUser, getUsers, updateUser, type User, type UserPayload } from '../api/users.ts'
import { getModules, type Module } from '../api/modules.ts'
import { getBranchs, type Branch } from '../api/branchs.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
import Alert from '../components/Alert.tsx'
import Modal from '../components/Modal.tsx'

type FormPermission = { module_id: number; access: string }

type FormState = {
    name: string
    login: string
    password: string
    role: UserPayload['role']
    status: boolean
    permissions: FormPermission[]
    branchsIds: number[]
}

const emptyForm: FormState = {
    name: '',
    login: '',
    password: '',
    role: 'user',
    status: true,
    permissions: [],
    branchsIds: []
}

export default function Users() {
    const { token } = useAuth()

    const [users, setUsers] = useState<User[]>([])
    const [modules, setModules] = useState<Module[]>([])
    const [branchs, setBranchs] = useState<Branch[]>([])
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
            const [usersResult, modulesResult, branchsResult] = await Promise.all([
                getUsers(token),
                getModules(token),
                getBranchs(token)
            ])
            setUsers(usersResult)
            setModules(modulesResult)
            setBranchs(branchsResult)
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar usuários.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    function openCreateModal() {
        setEditingId(null)
        setForm(emptyForm)
        setFormErro('')
        setModalOpen(true)
    }

    function openEditModal(user: User) {
        setEditingId(user.id)
        setForm({
            name: user.name,
            login: user.login,
            password: '',
            role: user.role,
            status: user.status,
            permissions: user.permissions.map((p) => ({ module_id: p.module_id, access: p.access })),
            branchsIds: user.branchs.map((b) => b.id)
        })
        setFormErro('')
        setModalOpen(true)
    }

    function toggleModulePermission(moduleId: number, checked: boolean) {
        setForm((prev) => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, { module_id: moduleId, access: 'read' }]
                : prev.permissions.filter((p) => p.module_id !== moduleId)
        }))
    }

    function changeModuleAccess(moduleId: number, access: string) {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.map((p) => (p.module_id === moduleId ? { ...p, access } : p))
        }))
    }

    function toggleBranch(branchId: number, checked: boolean) {
        setForm((prev) => ({
            ...prev,
            branchsIds: checked
                ? [...prev.branchsIds, branchId]
                : prev.branchsIds.filter((id) => id !== branchId)
        }))
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
            permissions: form.permissions,
            branchs_id: form.branchsIds,
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
        <>
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

                    <div>
                        <p className='text-sm font-medium text-gray-text mb-2'>Módulos</p>
                        <div className='flex flex-col gap-2 max-h-40 overflow-y-auto'>
                            {modules.map((module) => {
                                const permission = form.permissions.find((p) => p.module_id === module.id)

                                return (
                                    <div key={module.id} className='flex items-center gap-2'>
                                        <label className='flex items-center gap-2 text-sm text-gray-text flex-1'>
                                            <input
                                                type='checkbox'
                                                checked={!!permission}
                                                onChange={(e) => toggleModulePermission(module.id, e.target.checked)}
                                            />
                                            {module.name}
                                        </label>
                                        <select
                                            value={permission?.access ?? 'read'}
                                            disabled={!permission}
                                            onChange={(e) => changeModuleAccess(module.id, e.target.value)}
                                            className='rounded-md border border-gray-base bg-white px-2 py-1 text-xs text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base disabled:opacity-50'
                                        >
                                            <option value='read'>Leitura</option>
                                            <option value='admin'>Admin</option>
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <p className='text-sm font-medium text-gray-text mb-2'>Filiais</p>
                        <div className='flex flex-col gap-2 max-h-40 overflow-y-auto'>
                            {branchs.map((branch) => (
                                <label key={branch.id} className='flex items-center gap-2 text-sm text-gray-text'>
                                    <input
                                        type='checkbox'
                                        checked={form.branchsIds.includes(branch.id)}
                                        onChange={(e) => toggleBranch(branch.id, e.target.checked)}
                                    />
                                    {branch.name}
                                </label>
                            ))}
                        </div>
                    </div>

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
        </>
    )
}
