import { useState } from 'react'
import { CATEGORIES } from '../../../types/categories'
import type { CustomCategory } from '../../../types/categories'
import { useCategories } from '../hooks/useCategories'
import { CategoryForm }        from '../components/CategoryForm'
import { CategoryItem }        from '../components/CategoryItem'
import { DefaultCategoryItem } from '../components/DefaultCategoryItem'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="fn-card p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-base-300 rounded-full" />
            <div className="flex-1 h-4 bg-base-300 rounded" />
            <div className="w-10 h-5 bg-base-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CategoriesPage() {
  const {
    categories, allCategories, loading, error,
    createCategory, updateCategory, deleteCategory, toggleActive,
  } = useCategories()

  const [isFormOpen, setIsFormOpen]           = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [defaultsOpen, setDefaultsOpen]       = useState(false)

  const totalActive = allCategories.filter(c => c.isCustom ? categories.find(x => `custom_${x.id}` === c.value)?.active : true).length

  function handleEdit(cat: CustomCategory) {
    setEditingCategory(cat)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 pt-6 pb-28">

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold">Mis Categorías</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">{totalActive} categorías activas en total</p>
        </div>
        <button
          type="button"
          className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold border-none rounded-lg px-4 py-2 transition-all duration-200 whitespace-nowrap"
          onClick={() => { setEditingCategory(null); setIsFormOpen(true) }}
        >
          + Nueva
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div role="alert" className="alert alert-error text-sm mb-4"><span>{error}</span></div>
      )}

      {/* ── Sección: Mis categorías ─────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">
          Mis categorías
        </h2>

        {loading ? (
          <Skeleton />
        ) : categories.length === 0 ? (
          <div className="fn-card p-8 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl" aria-hidden="true">🏷️</span>
            <p className="font-medium text-base-content/70">Aún no tienes categorías personalizadas</p>
            <p className="text-sm text-base-content/50">Crea tu primera categoría para organizar tus gastos a tu manera.</p>
            <button
              type="button"
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold border-none rounded-lg px-4 py-2 transition-all duration-200 mt-1"
              onClick={() => setIsFormOpen(true)}
            >
              Crear categoría
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map(cat => (
              <CategoryItem
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={deleteCategory}
                onToggle={toggleActive}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Sección: Predefinidas (colapsable) ─────────────────────────────── */}
      <section>
        <button
          type="button"
          className="flex items-center justify-between w-full text-base font-semibold text-[#94A3B8] uppercase tracking-wide mb-3"
          onClick={() => setDefaultsOpen(p => !p)}
          aria-expanded={defaultsOpen}
        >
          <span>Predefinidas ({CATEGORIES.length})</span>
          <span aria-hidden="true" className="text-xs">{defaultsOpen ? '▲' : '▼'}</span>
        </button>

        {defaultsOpen && (
          <div className="flex flex-col gap-3">
            {CATEGORIES.map(cat => (
              <DefaultCategoryItem key={cat.id} emoji={cat.emoji} label={cat.label} />
            ))}
          </div>
        )}
      </section>

      {/* ── Modal: Formulario ───────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="modal modal-open">
          <div className="modal-backdrop" onClick={handleCloseForm} aria-hidden="true" />
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
            </h3>
            <CategoryForm
              category={editingCategory ?? undefined}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
              onCreate={createCategory}
              onUpdate={updateCategory}
            />
          </div>
        </div>
      )}

    </div>
  )
}
