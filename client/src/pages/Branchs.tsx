import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createBranch, deleteBranch, getBranchs, updateBranch, type Branch, type BranchPayload } from '../api/branchs.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
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

    async function handleDelete(branch: Branch) {
        if (!window.confirm(`Excluir a filial ${branch.name}?`)) {
            return
        }

        try {
            await deleteBranch(token, branch.id, branch.name)
            await loadBranchs()
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao excluir filial.')
        }
    }

    return (
        <>
            <div className='flex items-center justify-between mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                        Filiais
                    </h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Gerencie as filiais cadastradas no hub.
                    </p>
                </div>

                <Button onClick={openCreateModal}>Nova filial</Button>
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
                                            <Button variant='ghost' onClick={() => openEditModal(branch)}>
                                                Editar
                                            </Button>
                                            <Button variant='danger' onClick={() => handleDelete(branch)}>
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

            <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar filial' : 'Nova filial'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input
                        placeholder='Nome'
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                            Filial ativa
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
