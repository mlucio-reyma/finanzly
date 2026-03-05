import { ResetPasswordForm } from '../components/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary mb-2">Finanzly</h1>
          <h2 className="text-lg font-semibold text-center mb-6">Nueva contraseña</h2>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
