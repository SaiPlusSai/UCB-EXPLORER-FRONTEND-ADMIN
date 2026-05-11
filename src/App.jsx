import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CarrerasPage from './pages/CarrerasPage.jsx'
import ColegiosPage from './pages/ColegiosPage.jsx'
import TriviaPage from './pages/TriviaPage.jsx'
import PremiosPage from './pages/PremiosPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import RecordatoriosPage from './pages/RecordatoriosPage.jsx'
import AdminsPage from './pages/AdminsPage.jsx'
import QRPage from './pages/QRPage.jsx'
function ProtectedRoute({ children }) {
  const { token, cargandoSesion } = useAuth()
  if (cargandoSesion) return <div className="admin-loader" />
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="carreras" element={<CarrerasPage />} />
        <Route path="colegios" element={<ColegiosPage />} />
        <Route path="trivia" element={<TriviaPage />} />
        <Route path="premios" element={<PremiosPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="recordatorios" element={<RecordatoriosPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route
          path="qr"
          element={<QRPage />}
        />

      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
