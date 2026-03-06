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
        className="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 shadow-lg z-40"
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
