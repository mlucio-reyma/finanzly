import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="fn-card w-full max-w-sm">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-[#10B981] mb-2">Finanzly</h1>
          <h2 className="text-lg font-semibold text-center mb-6">Recuperar contraseña</h2>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
