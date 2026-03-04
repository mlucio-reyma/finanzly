# Feature 002 — Gestión de Gastos
**Proyecto:** Finanzly
**Estado:** 📋 Especificado | ⬜ En desarrollo | ✅ Implementado
**Esfuerzo estimado:** ~15 horas
**Dependencia:** Feature 001 (Auth) debe estar completa

---

## 📋 Descripción

CRUD completo de gastos personales. Es el núcleo funcional de Finanzly. El usuario puede registrar, editar, eliminar y filtrar todos sus gastos. Incluye el campo `establishment` para identificar el comercio donde se realizó el gasto — dato clave para el análisis inteligente de la Feature 005.

---

## 👤 Historias de Usuario

### US-002-01: Registrar gasto
**Como** usuario autenticado
**Quiero** registrar un nuevo gasto con todos sus detalles
**Para** mantener un registro preciso de mis finanzas

**Criterios de aceptación:**
- [ ] Formulario con campos: monto, categoría, fecha, descripción, establecimiento, método de pago
- [ ] Monto: solo números positivos, máximo 2 decimales
- [ ] Categoría: selector con las 12 categorías definidas + ícono
- [ ] Fecha: default hoy, selector de fecha completo
- [ ] Descripción: opcional, máximo 200 caracteres con contador visible
- [ ] Establecimiento: opcional, texto libre (ej: "Walmart", "Netflix", "OXXO")
- [ ] Método de pago: efectivo / débito / crédito / transferencia
- [ ] Confirmación visual (toast) tras guardar exitosamente
- [ ] Formulario se limpia tras guardar

---

### US-002-02: Ver historial de gastos
**Como** usuario autenticado
**Quiero** ver todos mis gastos registrados
**Para** tener visibilidad de mi historial financiero

**Criterios de aceptación:**
- [ ] Lista ordenada por fecha descendente (más reciente primero)
- [ ] Cada ítem muestra: monto, categoría (ícono + nombre), fecha, descripción corta
- [ ] Paginación o scroll infinito (mínimo 20 ítems por página)
- [ ] Estado vacío ilustrado si no hay gastos registrados
- [ ] Total del período visible en la parte superior

---

### US-002-03: Filtrar gastos
**Como** usuario autenticado
**Quiero** filtrar mis gastos por diferentes criterios
**Para** analizar períodos o categorías específicas

**Criterios de aceptación:**
- [ ] Filtro por rango de fechas (mes actual por defecto)
- [ ] Filtro por categoría (selección múltiple)
- [ ] Filtro por método de pago
- [ ] Buscador por descripción o establecimiento
- [ ] Filtros combinables entre sí
- [ ] Botón para limpiar todos los filtros
- [ ] Total actualizado según filtros activos

---

### US-002-04: Editar gasto
**Como** usuario autenticado
**Quiero** editar un gasto ya registrado
**Para** corregir errores o actualizar información

**Criterios de aceptación:**
- [ ] Formulario pre-llenado con datos actuales del gasto
- [ ] Mismas validaciones que el registro
- [ ] Confirmación visual tras guardar cambios
- [ ] Opción de cancelar sin guardar cambios

---

### US-002-05: Eliminar gasto
**Como** usuario autenticado
**Quiero** eliminar un gasto registrado
**Para** mantener limpio mi historial

**Criterios de aceptación:**
- [ ] Confirmación antes de eliminar ("¿Eliminar este gasto?")
- [ ] No se puede deshacer — advertencia clara
- [ ] Confirmación visual (toast) tras eliminar
- [ ] La lista se actualiza inmediatamente

---

## 🏗️ Arquitectura Técnica

### Estructura de archivos
```
src/
  features/
    expenses/
      components/
        ExpenseForm.tsx         # Formulario crear/editar
        ExpenseList.tsx         # Lista con paginación
        ExpenseItem.tsx         # Ítem individual de la lista
        ExpenseFilters.tsx      # Panel de filtros
        DeleteConfirmModal.tsx  # Modal de confirmación
      hooks/
        useExpenses.ts          # CRUD + estado de gastos
        useExpenseFilters.ts    # Lógica de filtros
      pages/
        ExpensesPage.tsx        # Vista principal de gastos
        NewExpensePage.tsx      # Página de nuevo gasto
      types/
        expense.types.ts        # Types e interfaces
  types/
    categories.ts               # Enum de categorías global
```

### Schema de base de datos
```sql
-- Tabla principal de gastos
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT CHECK (char_length(description) <= 200),
  establishment TEXT,
  payment_method TEXT DEFAULT 'efectivo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Categorías (Enum)
```typescript
export const CATEGORIES = [
  { id: 'alimentacion',    label: 'Alimentación',       emoji: '🍔' },
  { id: 'vivienda',        label: 'Vivienda',            emoji: '🏠' },
  { id: 'transporte',      label: 'Transporte / Gas',    emoji: '🚗' },
  { id: 'salud',           label: 'Salud',               emoji: '💊' },
  { id: 'entretenimiento', label: 'Entretenimiento',     emoji: '🎮' },
  { id: 'ropa',            label: 'Ropa',                emoji: '👕' },
  { id: 'educacion',       label: 'Educación',           emoji: '📚' },
  { id: 'trabajo',         label: 'Trabajo',             emoji: '💼' },
  { id: 'mascotas',        label: 'Mascotas',            emoji: '🐾' },
  { id: 'regalos',         label: 'Regalos',             emoji: '🎁' },
  { id: 'deudas',          label: 'Deudas / Créditos',  emoji: '💳' },
  { id: 'otros',           label: 'Otros',               emoji: '📦' },
] as const;
```

---

## 🎨 UI/UX

- FAB (Floating Action Button) "+" para agregar gasto rápido desde cualquier pantalla
- Swipe-to-delete en móvil para eliminar gastos
- Color por categoría para identificación visual rápida
- Skeleton loaders mientras cargan los datos

---

## ⚠️ Riesgos & Consideraciones

- El campo `establishment` es la entrada clave para Feature 005. Documentar a los usuarios que lo usen para mejores recomendaciones.
- Paginación del lado del servidor con Supabase (`.range()`) para no cargar todo el historial.
- Considerar índice full-text en `description` + `establishment` para el buscador si el volumen crece.
