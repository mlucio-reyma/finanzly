import { useState } from 'react'
import { ExpenseList } from '../components/ExpenseList'
import { ExpenseForm } from '../components/ExpenseForm'

// ── Componente ────────────────────────────────────────────────────────────────

export function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Incrementar esta clave fuerza el remount de ExpenseList,
  // provocando un refetch de la lista tras crear un nuevo gasto.
  const [listKey, setListKey] = useState(0)

  function handleFormSuccess() {
    setIsFormOpen(false)
    setListKey(prev => prev + 1)
  }

  return (
    // Contenedor con padding inferior para que el FAB no tape el último ítem
    <div className="container mx-auto max-w-2xl px-4 pt-6 pb-28">

      {/* Encabezado */}
      <h1 className="text-2xl font-bold mb-6">Mis Gastos</h1>

      {/* Lista de gastos con filtros integrados */}
      <ExpenseList key={listKey} />

      {/* FAB — botón flotante para agregar gasto */}
      <button
        type="button"
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg z-50 transition-all duration-200 hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
        onClick={() => setIsFormOpen(true)}
        aria-label="Agregar gasto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal de nuevo gasto */}
      {isFormOpen && (
        <div className="modal modal-open">
          <div className="modal-backdrop" onClick={() => setIsFormOpen(false)} aria-hidden="true" />
          <div className="modal-box w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4">Nuevo Gasto</h3>
            <ExpenseForm
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  )
}
