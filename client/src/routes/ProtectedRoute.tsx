import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'
import ChecklistNotifications from '../components/ChecklistNotifications.tsx'

export default function ProtectedRoute() {
    const { token } = useAuth()

    if (!token) {
        return <Navigate to='/login' replace />
    }

    return (
        <>
            <ChecklistNotifications />
            <Outlet />
        </>
    )
}
