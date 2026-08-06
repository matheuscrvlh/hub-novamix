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
}

const emptyForm: FormState = {
    name: '',
    login: '',
    password: '',
    role: 'user',
    status: true
}

type PermissionsFormState = {
    role: UserPayload['role']
    permissions: FormPermission[]
}

const emptyPermissionsForm: PermissionsFormState = { role: 'user', permissions: [] }

type BranchsFormState = {
    branchsIds: number[]
}

const emptyBranchsForm: BranchsFormState = { branchsIds: [] }

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

    const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
    const [permissionsTarget, setPermissionsTarget] = useState<User | null>(null)
    const [permissionsForm, setPermissionsForm] = useState<PermissionsFormState>(emptyPermissionsForm)
    const [permissionsSalvando, setPermissionsSalvando] = useState(false)
    const [permissionsErro, setPermissionsErro] = useState('')

    const [branchsModalOpen, setBranchsModalOpen] = useState(false)
    const [branchsTarget, setBranchsTarget] = useState<User | null>(null)
    const [branchsForm, setBranchsForm] = useState<BranchsFormState>(emptyBranchsForm)
    const [branchsSalvando, setBranchsSalvando] = useState(false)
    const [branchsErro, setBranchsErro] = useState('')

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
            status: user.status
        })
        setFormErro('')
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
    }

    function openPermissionsModal(user: User) {
        setPermissionsTarget(user)
        setPermissionsForm({
            role: user.role,
            permissions: user.permissions.map((p) => ({ module_id: p.module_id, access: p.access }))
        })
        setPermissionsErro('')
        setPermissionsModalOpen(true)
    }

    function closePermissionsModal() {
        setPermissionsModalOpen(false)
        setPermissionsTarget(null)
    }

    function toggleModulePermission(moduleId: number, checked: boolean) {
        setPermissionsForm((prev) => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, { module_id: moduleId, access: 'read' }]
                : prev.permissions.filter((p) => p.module_id !== moduleId)
        }))
    }

    function changeModuleAccess(moduleId: number, access: string) {
        setPermissionsForm((prev) => ({
            ...prev,
            permissions: prev.permissions.map((p) => (p.module_id === moduleId ? { ...p, access } : p))
        }))
    }

    function openBranchsModal(user: User) {
        setBranchsTarget(user)
        setBranchsForm({ branchsIds: user.branchs.map((b) => b.id) })
        setBranchsErro('')
        setBranchsModalOpen(true)
    }

    function closeBranchsModal() {
        setBranchsModalOpen(false)
        setBranchsTarget(null)
    }

    function toggleBranch(branchId: number, checked: boolean) {
        setBranchsForm((prev) => ({
            ...prev,
            branchsIds: checked
                ? [...prev.branchsIds, branchId]
                : prev.branchsIds.filter((id) => id !== branchId)
        }))
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

    async function handleSavePermissions(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!permissionsTarget) return

        setPermissionsSalvando(true)
        setPermissionsErro('')

        try {
            await updateUser(token, permissionsTarget.id, {
                name: permissionsTarget.name,
                login: permissionsTarget.login,
                role: permissionsForm.role,
                status: permissionsTarget.status,
                permissions: permissionsForm.permissions
            })

            closePermissionsModal()
            await loadUsers()
        } catch (error) {
            setPermissionsErro(error instanceof Error ? error.message : 'Erro ao salvar permissões.')
        } finally {
            setPermissionsSalvando(false)
        }
    }

    async function handleSaveBranchs(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!branchsTarget) return

        setBranchsSalvando(true)
        setBranchsErro('')

        try {
            await updateUser(token, branchsTarget.id, {
                name: branchsTarget.name,
                login: branchsTarget.login,
                role: branchsTarget.role,
                status: branchsTarget.status,
                branchs_id: branchsForm.branchsIds
            })

            closeBranchsModal()
            await loadUsers()
        } catch (error) {
            setBranchsErro(error instanceof Error ? error.message : 'Erro ao salvar filiais.')
        } finally {
            setBranchsSalvando(false)
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
                                            <Button variant='ghost' onClick={() => openPermissionsModal(user)}>
                                                Permissões
                                                {user.permissions.length > 0 && (
                                                    <span className='ml-1 text-orange-base'>
                                                        ({user.permissions.length})
                                                    </span>
                                                )}
                                            </Button>
                                            <Button variant='ghost' onClick={() => openBranchsModal(user)}>
                                                Filiais
                                                {user.branchs.length > 0 && (
                                                    <span className='ml-1 text-orange-base'>
                                                        ({user.branchs.length})
                                                    </span>
                                                )}
                                            </Button>
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
                        autoComplete='off'
                    />
                    <Input
                        placeholder='Login'
                        value={form.login}
                        onChange={(e) => setForm({ ...form, login: e.target.value })}
                        required
                        alwaysLight
                        autoComplete='off'
                    />
                    <Input
                        type='password'
                        placeholder={editingId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required={!editingId}
                        alwaysLight
                        autoComplete='new-password'
                    />

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

            <Modal
                open={permissionsModalOpen}
                onClose={closePermissionsModal}
                title={permissionsTarget ? `Permissões de ${permissionsTarget.name}` : 'Permissões'}
            >
                <form onSubmit={handleSavePermissions} className='flex flex-col gap-4'>
                    <div className='rounded-lg border border-orange-base/40 bg-orange-base/5 p-3'>
                        <p className='text-sm font-semibold text-gray-text mb-1'>Acesso ao Hub</p>
                        <p className='text-xs text-gray-dark mb-2'>
                            Administradores têm acesso total à área /admin do hub.
                        </p>
                        <select
                            value={permissionsForm.role}
                            onChange={(e) =>
                                setPermissionsForm((prev) => ({ ...prev, role: e.target.value as UserPayload['role'] }))
                            }
                            className='w-full rounded-md border border-gray-base bg-white px-3 py-2 text-sm text-gray-text outline-none focus:border-orange-base focus:ring-1 focus:ring-orange-base'
                        >
                            <option value='user'>Usuário</option>
                            <option value='admin'>Administrador</option>
                        </select>
                    </div>

                    <div>
                        <p className='text-sm font-medium text-gray-text mb-2'>Módulos</p>
                        <div className='flex flex-col gap-2 max-h-64 overflow-y-auto pr-1'>
                            {modules.length === 0 && (
                                <p className='text-sm text-gray-dark'>Nenhum módulo cadastrado.</p>
                            )}
                            {modules.map((module) => {
                                const permission = permissionsForm.permissions.find((p) => p.module_id === module.id)

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

                    {permissionsErro && <Alert>{permissionsErro}</Alert>}

                    <div className='flex items-center justify-end gap-2 mt-2'>
                        <Button type='button' variant='ghost' onClick={closePermissionsModal}>
                            Cancelar
                        </Button>
                        <Button type='submit' disabled={permissionsSalvando}>
                            {permissionsSalvando ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={branchsModalOpen}
                onClose={closeBranchsModal}
                title={branchsTarget ? `Filiais de ${branchsTarget.name}` : 'Filiais'}
            >
                <form onSubmit={handleSaveBranchs} className='flex flex-col gap-4'>
                    <div>
                        <p className='text-sm font-medium text-gray-text mb-2'>Filiais liberadas</p>
                        <div className='flex flex-col gap-2 max-h-64 overflow-y-auto pr-1'>
                            {branchs.length === 0 && (
                                <p className='text-sm text-gray-dark'>Nenhuma filial cadastrada.</p>
                            )}
                            {branchs.map((branch) => (
                                <label key={branch.id} className='flex items-center gap-2 text-sm text-gray-text'>
                                    <input
                                        type='checkbox'
                                        checked={branchsForm.branchsIds.includes(branch.id)}
                                        onChange={(e) => toggleBranch(branch.id, e.target.checked)}
                                    />
                                    {branch.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {branchsErro && <Alert>{branchsErro}</Alert>}

                    <div className='flex items-center justify-end gap-2 mt-2'>
                        <Button type='button' variant='ghost' onClick={closeBranchsModal}>
                            Cancelar
                        </Button>
                        <Button type='submit' disabled={branchsSalvando}>
                            {branchsSalvando ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
