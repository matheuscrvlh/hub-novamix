import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createSystem, deleteSystem, getSystems, updateSystem, type System, type SystemPayload } from '../api/systems.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
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

    async function handleDelete(system: System) {
        if (!window.confirm(`Excluir o sistema ${system.name}?`)) {
            return
        }

        try {
            await deleteSystem(token, system.id, system.name)
            await loadSystems()
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Erro ao excluir sistema.')
        }
    }

    return (
        <>
            <div className='flex items-center justify-between mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                        Sistemas
                    </h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Gerencie os sistemas externos que podem ser vinculados aos usuários.
                    </p>
                </div>

                <Button onClick={openCreateModal}>Novo sistema</Button>
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
                        ) : (
                            systems.map((system) => (
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
                                            <Button variant='ghost' onClick={() => openEditModal(system)}>
                                                Editar
                                            </Button>
                                            <Button variant='danger' onClick={() => handleDelete(system)}>
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

            <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar sistema' : 'Novo sistema'}>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
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

                    {editingId && (
                        <label className='flex items-center gap-2 text-sm text-gray-text'>
                            <input
                                type='checkbox'
                                checked={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.checked })}
                            />
                            Sistema ativo
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
