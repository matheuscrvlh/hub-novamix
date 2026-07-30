import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'

export default function ProtectedRoute() {
    const { token } = useAuth()

    if (!token) {
        return <Navigate to='/login' replace />
    }

    return <Outlet />
}
