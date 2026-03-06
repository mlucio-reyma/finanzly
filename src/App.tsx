import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ExpensesPage }   from './features/expenses/pages/ExpensesPage'
import { NewExpensePage }  from './features/expenses/pages/NewExpensePage'
import { DashboardPage }   from './features/dashboard/pages/DashboardPage'
import { RecurringPage }   from './features/recurring/pages/RecurringPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <ProtectedRoute>
              <NewExpensePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recurring"
          element={
            <ProtectedRoute>
              <RecurringPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta raíz → dashboard (ProtectedRoute redirige a /login si no hay sesión) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Ruta 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">404 — Página no encontrada</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
