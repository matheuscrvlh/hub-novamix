import Modal from './Modal.tsx'
import Button from './Button.tsx'
import Alert from './Alert.tsx'

type ConfirmModalProps = {
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    loading?: boolean
    erro?: string
    onConfirm: () => void
    onClose: () => void
}

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Excluir',
    loading = false,
    erro = '',
    onConfirm,
    onClose
}: ConfirmModalProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidthClassName='max-w-sm'>
            <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-6'>{message}</p>

            {erro && (
                <div className='mb-4'>
                    <Alert>{erro}</Alert>
                </div>
            )}

            <div className='flex items-center justify-end gap-2'>
                <Button type='button' variant='ghost' onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button type='button' variant='danger' onClick={onConfirm} disabled={loading}>
                    {loading ? 'Excluindo...' : confirmLabel}
                </Button>
            </div>
        </Modal>
    )
}
