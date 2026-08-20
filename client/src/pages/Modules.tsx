import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createModule, deleteModule, getModules, updateModule, type Module, type ModulePayload } from '../api/modules.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
import Select from '../components/Select.tsx'
import Alert from '../components/Alert.tsx'
import Modal from '../components/Modal.tsx'

type FormState = {
    name: string
    slug: string
    public_link: string
    private_link: string
    image: string
    status: boolean
}

const emptyForm: FormState = { name: '', slug: '', public_link: '', private_link: '', image: '', status: true }

export default function Modules() {
    const { token } = useAuth()

    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [salvando, setSalvando] = useState(false)
    const [formErro, setFormErro] = useState('')

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')

    const filteredModules = useMemo(() => {
        const term = search.trim().toLowerCase()

        return modules.filter((module) => {
            if (term && !module.name.toLowerCase().includes(term)) {
                return false
            }

            if (statusFilter !== 'all' && module.status !== (statusFilter === 'active')) {
                return false
            }

            return true
        })
    }, [modules, search, statusFilter])

    async function loadModules() {
        setLoading(true)
        setErro('')

        try {
            const result = await getModules(token)
            setModules(result)
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar módulos.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadModules()
    }, [])

    function openCreateModal() {
        setEditingId(null)
        setForm(emptyForm)
        setFormErro('')
        setModalOpen(true)
    }

    function openEditModal(module: Module) {
        setEditingId(module.id)
        setForm({
            name: module.name,
            slug: module.slug,
            public_link: module.public_link,
            private_link: module.private_link,
            image: module.image,
            status: module.status
        })
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

        const payload: ModulePayload = {
            name: form.name,
            slug: form.slug,
            public_link: form.public_link,
            private_link: form.private_link,
            image: form.image
        }

        try {
            if (editingId) {
                await updateModule(token, editingId, { ...payload, status: form.status })
            } else {
                await createModule(token, payload)
            }

            setModalOpen(false)
            await loadModules()
        } catch (error) {
            setFormErro(error instanceof Error ? error.message : 'Erro ao salvar módulo.')
        } finally {
            setSalvando(false)
        }
    }

    async function handleDelete(module: Module) {
        if (!window.confirm(`Excluir o módulo ${module.name}?`)) {
            return
        }

        try {
            await deleteModule(token, module.id, module.name)
            await loadModules()
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao excluir módulo.')
        }
    }

    return (
        <>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                        Módulos
                    </h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Gerencie os módulos disponíveis no hub.
                    </p>
                </div>

                <Button onClick={openCreateModal} className='self-start sm:self-auto'>Novo módulo</Button>
            </div>

            {erro && (
                <div className='mb-4'>
                    <Alert>{erro}</Alert>
                </div>
            )}

            <div className='mb-4 flex flex-wrap items-center gap-2'>
                <Input
                    placeholder='Buscar por nome'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full sm:w-56'
                />

                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className='w-40'
                >
                    <option value='all'>Todos os status</option>
                    <option value='active'>Ativo</option>
                    <option value='inactive'>Inativo</option>
                </Select>
            </div>

            <div className='hidden md:block rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                    <thead>
                        <tr className='border-b border-gray-base/30 dark:border-dark-border text-gray-dark dark:text-dark-text-muted'>
                            <th className='px-4 py-3 font-medium'>Nome</th>
                            <th className='px-4 py-3 font-medium'>Slug</th>
                            <th className='px-4 py-3 font-medium'>Link público</th>
                            <th className='px-4 py-3 font-medium'>Link privado</th>
                            <th className='px-4 py-3 font-medium'>Status</th>
                            <th className='px-4 py-3 font-medium text-right'>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Carregando...
                                </td>
                            </tr>
                        ) : modules.length === 0 ? (
                            <tr>
                                <td colSpan={6} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Nenhum módulo cadastrado.
                                </td>
                            </tr>
                        ) : filteredModules.length === 0 ? (
                            <tr>
                                <td colSpan={6} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Nenhum módulo encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        ) : (
                            filteredModules.map((module) => (
                                <tr
                                    key={module.id}
                                    className='border-b last:border-0 border-gray-base/20 dark:border-dark-border text-gray-text dark:text-dark-text'
                                >
                                    <td className='px-4 py-3'>{module.name}</td>
                                    <td className='px-4 py-3'>{module.slug}</td>
                                    <td className='px-4 py-3 truncate max-w-40'>{module.public_link}</td>
                                    <td className='px-4 py-3 truncate max-w-40'>{module.private_link}</td>
                                    <td className='px-4 py-3'>
                                        <span
                                            className={`rounded-full text-xs font-medium px-2 py-1 ${
                                                module.status
                                                    ? 'bg-green-base/10 text-green-base'
                                                    : 'bg-red-base/10 text-red-base'
                                            }`}
                                        >
                                            {module.status ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <Button variant='edit' onClick={() => openEditModal(module)}>
                                                ✏️ Editar
                                            </Button>
                                            <Button variant='danger' onClick={() => handleDelete(module)}>
                                                🗑️ Excluir
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className='md:hidden flex flex-col gap-3'>
                {loading ? (
                    <p className='px-1 py-6 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Carregando...
                    </p>
                ) : modules.length === 0 ? (
                    <p className='px-1 py-6 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhum módulo cadastrado.
                    </p>
                ) : filteredModules.length === 0 ? (
                    <p className='px-1 py-6 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhum módulo encontrado para os filtros selecionados.
                    </p>
                ) : (
                    filteredModules.map((module) => (
                        <div
                            key={module.id}
                            className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-4'
                        >
                            <div className='flex items-center justify-between gap-2 mb-2'>
                                <p className='font-medium text-gray-text dark:text-dark-text truncate'>
                                    {module.name}
                                </p>
                                <span
                                    className={`shrink-0 rounded-full text-xs font-medium px-2 py-1 ${
                                        module.status
                                            ? 'bg-green-base/10 text-green-base'
                                            : 'bg-red-base/10 text-red-base'
                                    }`}
                                >
                                    {module.status ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <dl className='text-sm text-gray-dark dark:text-dark-text-muted space-y-1 mb-3'>
                                <div className='flex gap-2'>
                                    <dt className='shrink-0'>Slug:</dt>
                                    <dd className='truncate text-gray-text dark:text-dark-text'>{module.slug}</dd>
                                </div>
                                <div className='flex gap-2'>
                                    <dt className='shrink-0'>Link público:</dt>
                                    <dd className='truncate text-gray-text dark:text-dark-text'>{module.public_link}</dd>
                                </div>
                                <div className='flex gap-2'>
                                    <dt className='shrink-0'>Link privado:</dt>
                                    <dd className='truncate text-gray-text dark:text-dark-text'>{module.private_link}</dd>
                                </div>
                            </dl>

                            <div className='flex flex-wrap gap-2'>
                                <Button variant='edit' onClick={() => openEditModal(module)}>
                                    ✏️ Editar
                                </Button>
                                <Button variant='danger' onClick={() => handleDelete(module)}>
                                    🗑️ Excluir
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar módulo' : 'Novo módulo'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input
                        placeholder='Nome'
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        alwaysLight
                    />
                    <Input
                        placeholder='Slug'
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        required
                        alwaysLight
                    />
                    <Input
                        placeholder='Link público'
                        value={form.public_link}
                        onChange={(e) => setForm({ ...form, public_link: e.target.value })}
                        required
                        alwaysLight
                    />
                    <Input
                        placeholder='Link privado'
                        value={form.private_link}
                        onChange={(e) => setForm({ ...form, private_link: e.target.value })}
                        required
                        alwaysLight
                    />
                    <Input
                        placeholder='Imagem (URL)'
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        required
                        alwaysLight
                    />

                    {editingId && (
                        <label className='flex items-center gap-2 text-sm text-gray-text'>
                            <input
                                type='checkbox'
                                checked={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.checked })}
                            />
                            Módulo ativo
                        </label>
                    )}

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
