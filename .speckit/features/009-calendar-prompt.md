# Prompt — Implementación Feature 009: Vista de Calendario

---

Lee el archivo `.speckit/features/009-calendar.md` antes de comenzar.
Lee también `.speckit/constitution.md` para respetar el stack y convenciones del proyecto.

Implementa el feature **Vista de Calendario** para Finanzly siguiendo estrictamente la spec.

---

## CONTEXTO DEL PROYECTO

- Stack: Vite + React + TypeScript + Tailwind CSS + DaisyUI
- Backend: Supabase (PostgreSQL + Auth)
- Estilo visual: tema dark navy, color brand `#10B981` (emerald)
- Patrón de clases CSS del proyecto: utilidades de Tailwind + clases `fn-*` para custom
- Convención de hooks: patrón idéntico a `useCategories` y `useAuth` existentes

---

## DEPENDENCIA A INSTALAR

```bash
npm install react-calendar
```

> ⚠️ IMPORTANTE: NO importes el CSS de react-calendar (`import 'react-calendar/dist/Calendar.css'`).
> Usa react-calendar ÚNICAMENTE por su lógica de navegación mensual mediante las props:
> - `tileContent` — para inyectar el contenido custom de cada celda
> - `tileClassName` — para aplicar clases Tailwind condicionales
> - `onChange` — para capturar el día seleccionado
> - `value` — fecha activa
> Todo el visual debe construirse con Tailwind + DaisyUI exclusivamente.

---

## DATOS IMPORTANTES DEL SCHEMA

La tabla `recurring_payments` usa el campo **`due_day`** (integer, 1-31) para
indicar el día del mes en que vence el pago. NO uses `day_of_month`.

---

## ARCHIVOS A CREAR

### 1. `src/features/calendar/types/calendar.types.ts`
Define las interfaces:
- `ExpenseEntry` — id, amount, description, category (name, icon, color)
- `RecurrentEntry` — id, name, amount, dueDay, isPaid
- `DayData` — date (YYYY-MM-DD), expenses[], recurrents[], totalExpenses, hasExpenses, hasRecurrents
- `CalendarDataMap` — Record<string, DayData>

---

### 2. `src/features/calendar/hooks/useCalendarData.ts`
Hook con estas responsabilidades:
- Recibe `year: number` y `month: number` (month = 0-indexed, como Date de JS)
- Hace 2 queries en paralelo con `Promise.all`:
  1. `expenses` del mes: campos id, amount, date, description + join a categories(name, icon, color)
     - Filtrar por `date >= firstDay` y `date <= lastDay` del mes
  2. `recurring_payments` activos: id, name, amount, due_day, is_active
     - Solo los que tienen `is_active = true`
- Agrega los resultados en un `CalendarDataMap` (objeto indexado por 'YYYY-MM-DD')
- Para los recurrentes: validar que `due_day` exista en el mes actual
  (ej: due_day=31 NO aparece en febrero). Usar `new Date(year, month+1, 0).getDate()`
  para obtener el último día del mes.
- Para `isPaid` de cada recurrente: marcar como `true` si existe algún gasto
  en ese mismo día que coincida en monto (lógica simple, no bloquea el feature)
- Cache en estado local — key: `"YYYY-M"`. Si la key ya existe, no re-fetcha.
- Retorna: `{ dataMap, loading, error }`

---

### 3. `src/features/calendar/components/CalendarHeader.tsx`
Props: `year`, `month`, `onPrev`, `onNext`, `totalMonth`
- Muestra: `"< Marzo 2026 >"` con botones de navegación
- Debajo: `"Total del mes: $X,XXX"` en texto emerald
- Nombres de meses en español

---

### 4. `src/features/calendar/components/CalendarDayCell.tsx`
Props: `dayData: DayData | null`, `isToday: boolean`
- Si `dayData` es null o no tiene movimientos: celda vacía sin indicadores
- Si tiene gastos: muestra `$X,XXX` en texto pequeño emerald (11px)
- Dots en la parte inferior de la celda:
  - Dot verde `●` `#10B981` si `hasExpenses`
  - Dot azul `●` `#3B82F6` si `hasRecurrents`
- Si `isToday`: fondo `bg-emerald-500/20` + borde `border border-[#10B981]`
- Cursor pointer si tiene datos, cursor default si no tiene

---

### 5. `src/features/calendar/components/CalendarDayModal.tsx`
Props: `dayData: DayData`, `date: Date`, `onClose: () => void`
- Modal centrado con overlay oscuro (`bg-black/60`)
- Ancho: `w-[90vw] max-w-[480px]`
- Header: fecha en español completa + botón X
- Sección "💳 Gastos" (solo si `hasExpenses`):
  - Lista cada gasto: `{category.icon} {description}` + `$amount` alineado a la derecha
  - Footer de sección: `Total: $X,XXX` en emerald
- Sección "🔄 Pagos Recurrentes" (solo si `hasRecurrents`):
  - Lista cada recurrente: nombre + monto + badge de estado
  - Badge `isPaid`: verde "✓ Pagado" / amarillo "● Pendiente"
- Click en overlay cierra el modal
- Animación de entrada: `animate-fadeIn` o transition simple con opacity

---

### 6. `src/features/calendar/components/CalendarLegend.tsx`
- Componente simple, sin props
- Muestra: `● Gastos  ● Recurrentes` con sus colores respectivos
- Texto pequeño, posicionado debajo del calendario

---

### 7. `src/features/calendar/pages/CalendarPage.tsx`
Ensambla todos los componentes:
- Estado local: `activeDate` (Date) — mes actualmente visible
- Usa `useCalendarData(year, month)` con el año/mes de `activeDate`
- Usa `react-calendar` con:
  - `tileContent={({ date }) => <CalendarDayCell ... />}`
  - `tileClassName` para estilos base de celda
  - `onClickDay={(date) => { if (dataMap[dateKey]?.hasExpenses || hasRecurrents) openModal(date) }}`
  - `showNavigation={false}` — la navegación la maneja `CalendarHeader`
  - `locale="es-ES"`
- Estado `selectedDay: string | null` para controlar qué modal abrir
- Loading: skeleton de grilla 7×5 mientras carga
- Error: mensaje con botón reintentar

---

## ARCHIVOS A MODIFICAR

### `src/router.tsx`
Agrega la ruta protegida:
```tsx
{
  path: '/calendar',
  element: <ProtectedRoute><CalendarPage /></ProtectedRoute>
}
```
Importa `CalendarPage` con lazy loading: `const CalendarPage = lazy(() => import('./features/calendar/pages/CalendarPage'))`

### `src/components/layout/Sidebar.tsx`
Agrega ítem de navegación entre Dashboard e Historial (o al final si no caben):
- Ícono: `CalendarDays` de `lucide-react`
- Label: `"Calendario"`
- Path: `"/calendar"`
- Mismo patrón visual que los ítems existentes

### `src/components/layout/BottomNav.tsx`
Mismo ítem de navegación que en Sidebar, adaptado al patrón del bottom nav móvil.

---

## RESTRICCIONES IMPORTANTES

1. NO modifiques ningún archivo fuera de los listados arriba.
2. NO importes el CSS de react-calendar bajo ninguna circunstancia.
3. Todos los textos de la UI en **español**.
4. Sigue el patrón de manejo de errores existente en el proyecto (toast o mensaje inline).
5. Los montos siempre formateados como `$X,XXX` en pesos mexicanos (locale `es-MX`).
6. Máximo 150 líneas por componente — divide si es necesario.
