import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/Navigation'
import { ExpensesPage }  from './features/expenses/pages/ExpensesPage'
import { NewExpensePage } from './features/expenses/pages/NewExpensePage'
import { DashboardPage }  from './features/dashboard/pages/DashboardPage'
import { RecurringPage }  from './features/recurring/pages/RecurringPage'
import { AnalysisPage }    from './features/analysis/pages/AnalysisPage'
import { CategoriesPage }  from './features/categories/pages/CategoriesPage'

// AppLayout ya incluye Navigation internamente; Outlet renderiza la ruta hija activa.
const PrivateLayout = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas — sin navegación */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Rutas privadas — con navegación vía AppLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PrivateLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="expenses"     element={<ExpensesPage />} />
          <Route path="expenses/new" element={<NewExpensePage />} />
          <Route path="categories"   element={<CategoriesPage />} />
          <Route path="recurring"    element={<RecurringPage />} />
          <Route path="analysis"     element={<AnalysisPage />} />
        </Route>

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
