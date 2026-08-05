import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '../hooks/useAuth.ts'
import { createModule, deleteModule, getModules, updateModule, type Module, type ModulePayload } from '../api/modules.ts'
import Button from '../components/Button.tsx'
import Input from '../components/Input.tsx'
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
            <div className='flex items-center justify-between mb-6 gap-4'>
                <div>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>
                        Módulos
                    </h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted'>
                        Gerencie os módulos disponíveis no hub.
                    </p>
                </div>

                <Button onClick={openCreateModal}>Novo módulo</Button>
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
                        ) : (
                            modules.map((module) => (
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
                                            <Button variant='ghost' onClick={() => openEditModal(module)}>
                                                Editar
                                            </Button>
                                            <Button variant='danger' onClick={() => handleDelete(module)}>
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
