import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createBranch, deleteBranch, getBranchs, updateBranch, type Branch, type BranchPayload } from '../api/branchs.ts'
import Button from '../components/Button.tsx'
import IconButton from '../components/IconButton.tsx'
import ConfirmModal from '../components/ConfirmModal.tsx'
import { Pencil, Trash, Plus } from 'lucide-react'
import Input from '../components/Input.tsx'
import Switch from '../components/Switch.tsx'
import Alert from '../components/Alert.tsx'
import Modal from '../components/Modal.tsx'

type FormState = {
    name: string
    status: boolean
}

const emptyForm: FormState = { name: '', status: true }

export default function Branchs() {
    const { token } = useAuth()

    const [branchs, setBranchs] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [salvando, setSalvando] = useState(false)
    const [formErro, setFormErro] = useState('')

    const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteErro, setDeleteErro] = useState('')

    async function loadBranchs() {
        setLoading(true)
        setErro('')

        try {
            const result = await getBranchs(token)
            setBranchs(result)
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao buscar filiais.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadBranchs()
    }, [])

    function openCreateModal() {
        setEditingId(null)
        setForm(emptyForm)
        setFormErro('')
        setModalOpen(true)
    }

    function openEditModal(branch: Branch) {
        setEditingId(branch.id)
        setForm({ name: branch.name, status: branch.status })
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

        try {
            if (editingId) {
                const payload: BranchPayload = { name: form.name, status: form.status }
                await updateBranch(token, editingId, payload)
            } else {
                await createBranch(token, { name: form.name })
            }

            setModalOpen(false)
            await loadBranchs()
        } catch (error) {
            setFormErro(error instanceof Error ? error.message : 'Erro ao salvar filial.')
        } finally {
            setSalvando(false)
        }
    }

    function handleDelete(branch: Branch) {
        setDeleteErro('')
        setDeleteTarget(branch)
    }

    async function confirmDelete() {
        if (!deleteTarget) return

        setDeleting(true)
        setDeleteErro('')

        try {
            await deleteBranch(token, deleteTarget.id, deleteTarget.name)
            setDeleteTarget(null)
            await loadBranchs()
        } catch (error) {
            setDeleteErro(error instanceof Error ? error.message : 'Erro ao excluir filial.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                        Filiais
                    </h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Gerencie as filiais cadastradas no hub.
                    </p>
                </div>

                <Button
                    onClick={openCreateModal}
                    aria-label='Nova filial'
                    title='Nova filial'
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

            <div className='hidden md:block rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                    <thead>
                        <tr className='border-b border-gray-base/30 dark:border-dark-border text-gray-dark dark:text-dark-text-muted'>
                            <th className='px-4 py-3 font-medium'>Nome</th>
                            <th className='px-4 py-3 font-medium'>Status</th>
                            <th className='px-4 py-3 font-medium text-right'>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Carregando...
                                </td>
                            </tr>
                        ) : branchs.length === 0 ? (
                            <tr>
                                <td colSpan={3} className='px-4 py-6 text-center text-gray-dark dark:text-dark-text-muted'>
                                    Nenhuma filial cadastrada.
                                </td>
                            </tr>
                        ) : (
                            branchs.map((branch) => (
                                <tr
                                    key={branch.id}
                                    className='border-b last:border-0 border-gray-base/20 dark:border-dark-border text-gray-text dark:text-dark-text'
                                >
                                    <td className='px-4 py-3'>{branch.name}</td>
                                    <td className='px-4 py-3'>
                                        <span
                                            className={`rounded-full text-xs font-medium px-2 py-1 ${
                                                branch.status
                                                    ? 'bg-green-base/10 text-green-base'
                                                    : 'bg-red-base/10 text-red-base'
                                            }`}
                                        >
                                            {branch.status ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex items-center justify-end gap-2'>
                                            <IconButton icon={<Pencil size={16} />} label='Editar' variant='edit' onClick={() => openEditModal(branch)} />
                                            <IconButton icon={<Trash size={16} />} label='Excluir' variant='danger' onClick={() => handleDelete(branch)} />
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
                ) : branchs.length === 0 ? (
                    <p className='px-1 py-6 text-center text-sm text-gray-dark dark:text-dark-text-muted'>
                        Nenhuma filial cadastrada.
                    </p>
                ) : (
                    branchs.map((branch) => (
                        <div
                            key={branch.id}
                            className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-4'
                        >
                            <div className='flex items-center justify-between gap-2 mb-3'>
                                <p className='font-medium text-gray-text dark:text-dark-text truncate'>
                                    {branch.name}
                                </p>
                                <span
                                    className={`shrink-0 rounded-full text-xs font-medium px-2 py-1 ${
                                        branch.status
                                            ? 'bg-green-base/10 text-green-base'
                                            : 'bg-red-base/10 text-red-base'
                                    }`}
                                >
                                    {branch.status ? 'Ativa' : 'Inativa'}
                                </span>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                <IconButton icon={<Pencil size={16} />} label='Editar' variant='edit' onClick={() => openEditModal(branch)} />
                                <IconButton icon={<Trash size={16} />} label='Excluir' variant='danger' onClick={() => handleDelete(branch)} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar filial' : 'Nova filial'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <Input
                        placeholder='Nome'
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        alwaysLight
                    />

                    {editingId && (
                        <Switch
                            checked={form.status}
                            onChange={(status) => setForm({ ...form, status })}
                            label='Filial ativa'
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
                title='Excluir filial'
                message={`Tem certeza que deseja excluir a filial "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
                loading={deleting}
                erro={deleteErro}
                onConfirm={confirmDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </>
    )
}
