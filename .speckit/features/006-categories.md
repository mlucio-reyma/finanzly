# Feature 006 — Categorías CRUD
**Proyecto:** Finanzly
**Estado:** ✅ Implementado
**Esfuerzo estimado:** ~6 horas
**Dependencia:** Feature 002 (Gastos) debe estar completa

---

## 📋 Descripción

Módulo para gestionar categorías personalizadas de gastos. El usuario puede crear sus propias categorías (con emoji y color), activarlas/desactivarlas, editarlas y eliminarlas. Las categorías del sistema (predefinidas) se muestran como referencia pero no son modificables. Las categorías personalizadas activas aparecen en el formulario de gastos junto a las predefinidas, separadas por un optgroup.

---

## 👤 Historias de Usuario

### US-006-01: Crear categoría personalizada
**Como** usuario autenticado
**Quiero** crear mis propias categorías de gasto
**Para** organizar mis gastos de forma personalizada

**Criterios de aceptación:**
- [x] Formulario con: nombre (max 30 chars, uppercase), emoji (picker de 30 opciones) y color (8 colores predefinidos)
- [x] Validación: nombre obligatorio
- [x] Confirmación visual tras guardar
- [x] La nueva categoría aparece de inmediato en la lista y en el formulario de gastos

---

### US-006-02: Ver lista de categorías
**Como** usuario autenticado
**Quiero** ver todas mis categorías en un solo lugar
**Para** gestionarlas fácilmente

**Criterios de aceptación:**
- [x] Sección "Mis categorías" con las categorías personalizadas del usuario
- [x] Sección "Predefinidas" colapsable con las 12 categorías del sistema (solo lectura)
- [x] Cada ítem muestra: emoji, nombre, dot de color, toggle activo/inactivo
- [x] Total de categorías activas visible en el encabezado
- [x] Estado vacío ilustrado si no hay categorías personalizadas
- [x] Skeleton loader durante la carga inicial

---

### US-006-03: Editar categoría personalizada
**Como** usuario autenticado
**Quiero** editar una categoría que creé
**Para** corregir el nombre, emoji o color

**Criterios de aceptación:**
- [x] Botón de edición (ícono lápiz) en cada ítem de categoría personalizada
- [x] Abre el mismo formulario pre-cargado con los datos actuales
- [x] Los cambios se reflejan inmediatamente en la lista y en el formulario de gastos

---

### US-006-04: Eliminar categoría personalizada
**Como** usuario autenticado
**Quiero** eliminar una categoría que ya no uso
**Para** mantener mi lista limpia

**Criterios de aceptación:**
- [x] Botón de eliminar (ícono papelera) en cada ítem
- [x] Confirmación inline (¿Eliminar? / Sí / No) antes de ejecutar
- [x] La categoría desaparece de la lista y del formulario de gastos inmediatamente

---

### US-006-05: Activar / desactivar categoría personalizada
**Como** usuario autenticado
**Quiero** desactivar temporalmente una categoría sin eliminarla
**Para** mantener el registro pero ocultarla del formulario de gastos

**Criterios de aceptación:**
- [x] Toggle activo/inactivo en cada ítem de categoría personalizada
- [x] Las categorías inactivas aparecen con `opacity-50` y texto `line-through`
- [x] Las categorías inactivas NO aparecen en el select del formulario de gastos

---

### US-006-06: Seleccionar categoría personalizada al registrar un gasto
**Como** usuario autenticado
**Quiero** poder elegir mis categorías personalizadas al registrar un gasto
**Para** categorizar gastos con mis propias etiquetas

**Criterios de aceptación:**
- [x] El select de categoría en ExpenseForm muestra primero las predefinidas (optgroup "Categorías")
- [x] Las categorías personalizadas activas aparecen en un segundo optgroup "— Mis categorías —"
- [x] Si no hay categorías personalizadas activas, el segundo optgroup no aparece

---

## 🏗️ Arquitectura Técnica

### Estructura de archivos
```
src/
  types/
    categories.ts                    # CustomCategory type añadido
  features/
    categories/
      components/
        CategoryForm.tsx             # Formulario crear/editar (emoji picker + color picker)
        CategoryItem.tsx             # Ítem con toggle, editar, eliminar inline
        DefaultCategoryItem.tsx      # Ítem de solo lectura para categorías del sistema
      hooks/
        useCategories.ts             # CRUD de custom_categories + allCategories combinado
      pages/
        CategoriesPage.tsx           # Página completa con modal y sección colapsable
```

### Tipos clave
```typescript
// src/types/categories.ts
export type CustomCategory = {
  id: string
  user_id: string
  label: string
  emoji: string
  color: string
  active: boolean
  created_at: string
}

// src/features/categories/hooks/useCategories.ts
export type UnifiedCategory = {
  value:    string   // category.id para predefinidas, 'custom_' + id para personalizadas
  label:    string
  emoji:    string
  color?:   string
  isCustom: boolean
}
```

### Schema de base de datos
```sql
CREATE TABLE custom_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  label TEXT NOT NULL CHECK (char_length(label) <= 30),
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_custom_categories_user_id ON custom_categories(user_id);

ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own custom categories"
  ON custom_categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Integración con Feature 002 (Gastos)
- `useExpenses.ts` llama a `useCategories()` internamente y expone `allCategories`
- `ExpenseForm.tsx` usa `allCategories` con estructura `<optgroup>` para separar sistema/personalizadas
- El valor guardado en `expenses.category` para personalizadas es `'custom_' + id`

---

## 🎨 UI/UX

- Modal para crear/editar (no página separada)
- Sección "Predefinidas" colapsable con ▲/▼ para no saturar la vista inicial
- Dot de color circular junto al nombre de cada categoría personalizada
- Toggle DaisyUI `toggle-success` para activo/inactivo
- Confirmación de eliminación inline (sin modal adicional)
- Skeleton loader de 3 tarjetas durante carga

---

## ⚠️ Notas de Implementación

- Las categorías predefinidas (CATEGORIES en `src/types/categories.ts`) son inmutables — solo lectura.
- El valor `custom_` como prefijo del `id` distingue categorías personalizadas en el campo `category` de `expenses`.
- `allCategories` combina predefinidas + personalizadas activas; se comparte vía `useExpenses` para no duplicar llamadas a Supabase en la misma página.
