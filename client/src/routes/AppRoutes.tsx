import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../pages/Login.tsx'
import Home from '../pages/Home.tsx'
import Users from '../pages/Users.tsx'
import ProtectedRoute from './ProtectedRoute.tsx'
import AdminRoute from './AdminRoute.tsx'
import { useAuth } from '../hooks/useAuth.ts'

function RootRedirect() {
    const { token } = useAuth()

    return <Navigate to={token ? '/home' : '/login'} replace />
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route path='/home' element={<Home />} />

                <Route element={<AdminRoute />}>
                    <Route path='/users' element={<Users />} />
                </Route>
            </Route>

            <Route path='/' element={<RootRedirect />} />
            <Route path='*' element={<RootRedirect />} />
        </Routes>
    )
}
