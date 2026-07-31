import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.ts'

export default function AdminRoute() {
    const { token, role } = useAuth()

    if (!token) {
        return <Navigate to='/login' replace />
    }

    if (role !== 'admin') {
        return <Navigate to='/home' replace />
    }

    return <Outlet />
}
