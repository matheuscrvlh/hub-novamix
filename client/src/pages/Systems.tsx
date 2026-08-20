import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createSystem, deleteSystem, getSystems, updateSystem, type System, type SystemPayload } from '../api/systems.ts'
import Button from '../components/Button.tsx'
import IconButton from '../components/IconButton.tsx'
import ConfirmModal from '../components/ConfirmModal.tsx'
import { Pencil, Trash, Plus } from 'lucide-react'
import Input from '../components/Input.tsx'
import Select from '../components/Select.tsx'
import Switch from '../components/Switch.tsx'
import Alert from '../components/Alert.tsx'
import Modal from '../components/Modal.tsx'

type FormState = {
    name: string
    link: string
    status: boolean
}

const emptyForm: FormState = { name: '', link: '', status: true }

export default function Systems() {
    const { token } = useAuth()

    const [systems, setSystems] = useState<System[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [salvando, setSalvando] = useState(false)
    const [formErro, setFormErro] = useState('')

    const [deleteTarget, setDeleteTarget] = useState<System | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteErro, setDeleteErro] = useState('')

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active')

    const filteredSystems = useMemo(() => {
        const term = search.trim().toLowerCase()

        return systems.filter((system) => {
            if (term && !system.name.toLowerCase().includes(term)) {
                return false
            }

            if (statusFilter !== 'all' && system.status !== (statusFilter === 'active')) {
                return false
            }

            return true
        })
    }, [systems, search, statusFilter])

    async function loadSystems() {
        setLoading(true)
        setErro('')

        try {
            const result = await getSystems(token)
            setSystems(result)
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar sistemas.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSystems()
    }, [])

    function openCreateModal() {
        setEditingId(null)
        setForm(emptyForm)
        setFormErro('')
        setModalOpen(true)
    }

    function openEditModal(system: System) {
        setEditingId(system.id)
        setForm({ name: system.name, link: system.link ?? '', status: system.status })
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

        const payload: SystemPayload = { name: form.name, link: form.link }

        try {
            if (editingId) {
                await updateSystem(token, editingId, { ...payload, status: form.status })
            } else {
                await createSystem(token, payload)
            }

            setModalOpen(false)
            await loadSystems()
        } catch (error) {
            setFormErro(error instanceof Error ? error.message : 'Erro ao salvar sistema.')
        } finally {
            setSalvando(false)
        }
    }

    function handleDelete(system: System) {
        setDeleteErro('')
        setDeleteTarget(system)
    }

    async function confirmDelete() {
        if (!deleteTarget) return

        setDeleting(true)
        setDeleteErro('')

        try {
            await deleteSystem(token, deleteTarget.id, deleteTarget.name)
            setDeleteTarget(null)
            await loadSystems()
        } catch (error) {
            setDeleteErro(error instanceof Error ? error.message : 'Erro ao excluir sistema.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                        Sistemas
                    </h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Gerencie os sistemas externos que podem ser vinculados aos usuários.
                    </p>
                </div>

                <Button
                    onClick={openCreateModal}
                    aria-label='Novo sistema'
                    title='Novo sistema'
                    className='self-start sm:self-auto p-2.5'
                >
                    <Plus size={18} />
                </Button>
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
                            <th className='px-4 py-3 font-medium'>Link</th>
                            <th className='px-4 py-3 font-medium'>Status</th>
                            <th className='px-4 py-3 font-medium text-right'>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Carregando...
                                </td>
                            </tr>
                        ) : systems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Nenhum sistema cadastrado.
                                </td>
                            </tr>
                        ) : filteredSystems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Nenhum sistema encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        ) : (
                            filteredSystems.map((system) => (
                                <tr
                                    key={system.id}
                                    className='border-b last:border-0 border-gray-base/20 dark:border-dark-border text-gray-text dark:text-dark-text'
                                >
                                    <td className='px-4 py-3'>{system.name}</td>
                                    <td className='px-4 py-3 truncate max-w-40'>{system.link}</td>
                                    <td className='px-4 py-3'>
                                        <span
                                            className={`rounded-full text-xs font-medium px-2 py-1 ${
                                                system.status
                                                    ? 'bg-green-base/10 text-green-base'
                                                    : 'bg-red-base/10 text-red-base'
                                            }`}
                                        >
                                            {system.status ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <IconButton icon={<Pencil size={16} />} label='Editar' variant='edit' onClick={() => openEditModal(system)} />
                                            <IconButton icon={<Trash size={16} />} label='Excluir' variant='danger' onClick={() => handleDelete(system)} />
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
                ) : systems.length === 0 ? (
                    <p className='px-1 py-6 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhum sistema cadastrado.
                    </p>
                ) : filteredSystems.length === 0 ? (
                    <p className='px-1 py-6 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhum sistema encontrado para os filtros selecionados.
                    </p>
                ) : (
                    filteredSystems.map((system) => (
                        <div
                            key={system.id}
                            className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-4'
                        >
                            <div className='flex items-center justify-between gap-2 mb-2'>
                                <p className='font-medium text-gray-text dark:text-dark-text truncate'>
                                    {system.name}
                                </p>
                                <span
                                    className={`shrink-0 rounded-full text-xs font-medium px-2 py-1 ${
                                        system.status
                                            ? 'bg-green-base/10 text-green-base'
                                            : 'bg-red-base/10 text-red-base'
                                    }`}
                                >
                                    {system.status ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            {system.link && (
                                <p className='text-sm text-gray-dark dark:text-dark-text-muted truncate mb-3'>
                                    {system.link}
                                </p>
                            )}

                            <div className='flex flex-wrap gap-2'>
                                <IconButton icon={<Pencil size={16} />} label='Editar' variant='edit' onClick={() => openEditModal(system)} />
                                <IconButton icon={<Trash size={16} />} label='Excluir' variant='danger' onClick={() => handleDelete(system)} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar sistema' : 'Novo sistema'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <Input
                            placeholder='Nome'
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            alwaysLight
                        />
                        <Input
                            placeholder='Link'
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                            alwaysLight
                        />
                    </div>

                    {editingId && (
                        <Switch
                            checked={form.status}
                            onChange={(status) => setForm({ ...form, status })}
                            label='Sistema ativo'
                        />
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

            <ConfirmModal
                open={!!deleteTarget}
                title='Excluir sistema'
                message={`Tem certeza que deseja excluir o sistema "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
                loading={deleting}
                erro={deleteErro}
                onConfirm={confirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </>
    )
}
