import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TeacherPortal from './pages/TeacherPortal'
import PrincipalPortal from './pages/PrincipalPortal'
import PublicLivePage from './pages/PublicLivePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="teacher" element={<TeacherPortal />} />
            <Route path="principal" element={<PrincipalPortal />} />
            <Route path="live" element={<PublicLivePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
