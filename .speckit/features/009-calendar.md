# Feature 009 — Vista de Calendario
**Proyecto:** Finanzly
**Estado:** ✅ Implementado
**Esfuerzo estimado:** ~10 horas
**Dependencia:** Features 002 (Gastos) y 004 (Recurrentes) deben estar completas

---

## 📋 Descripción

Vista de calendario mensual que distribuye los gastos y pagos recurrentes del usuario sobre una grilla navegable. Permite identificar días de alto gasto, anticipar compromisos financieros y navegar entre meses con caché local para una experiencia fluida.

---

## 👤 Historias de Usuario

### US-009-01: Ver gastos distribuidos en el calendario
**Como** usuario autenticado
**Quiero** ver mis gastos organizados en una vista de calendario mensual
**Para** identificar rápidamente los días de mayor gasto

**Criterios de aceptación:**
- [x] Grilla mensual con 7 columnas (Lun–Dom)
- [x] Monto total de gastos por día en verde (#10B981)
- [x] Dot verde en días con gastos
- [x] Navegación entre meses con botones ‹ ›
- [x] Día actual resaltado visualmente

---

### US-009-02: Ver pagos recurrentes en el calendario
**Como** usuario autenticado
**Quiero** ver mis pagos recurrentes en su día de vencimiento dentro del calendario
**Para** anticipar mis compromisos financieros del mes

**Criterios de aceptación:**
- [x] Monto del recurrente mostrado en azul (#3B82F6) en su día de vencimiento
- [x] Dot azul en días con recurrentes
- [x] Días 29, 30 y 31 omitidos en meses que no los tienen (ej: febrero)
- [x] Días con gastos Y recurrentes muestran ambos montos apilados

---

### US-009-03: Ver detalle de un día
**Como** usuario autenticado
**Quiero** hacer clic en un día del calendario para ver el detalle de sus movimientos
**Para** ver exactamente qué gasté o qué vence ese día

**Criterios de aceptación:**
- [x] Modal al hacer clic en cualquier día con movimientos
- [x] Sección "💳 Gastos" con ícono de categoría, descripción y monto
- [x] Total de gastos del día al pie de la sección
- [x] Sección "🔄 Pagos Recurrentes" con nombre, monto y badge Pagado/Pendiente
- [x] Click en el overlay cierra el modal

---

### US-009-04: Navegar entre meses con caché
**Como** usuario autenticado
**Quiero** navegar entre meses sin esperas repetidas
**Para** revisar meses anteriores de forma ágil

**Criterios de aceptación:**
- [x] Header con nombre del mes en español y año
- [x] Total del mes en emerald bajo el título
- [x] Si hay recurrentes pero no gastos: "Sin gastos registrados" + "Recurrentes del mes: $X"
- [x] Caché en memoria por mes — no re-fetcha si ya se cargó
- [x] Skeleton de grilla 7×5 mientras carga

---

## 🏗️ Arquitectura Técnica

### Librería de calendario
**react-calendar** — usada únicamente por su estructura de grilla mensual.
- Sin importar su CSS (`react-calendar/dist/Calendar.css`)
- Todo el visual mediante Tailwind CSS + DaisyUI
- Props utilizadas: `tileContent`, `tileClassName`, `onClickDay`, `value`, `activeStartDate`, `showNavigation={false}`, `formatDay`

### Estructura de archivos
```
src/features/calendar/
  types/
    calendar.types.ts         # ExpenseEntry, RecurrentEntry, DayData, CalendarDataMap
  hooks/
    useCalendarData.ts        # 3 queries en paralelo + caché por mes en useRef
  components/
    CalendarHeader.tsx        # Navegación mensual + totales condicionales
    CalendarDayCell.tsx       # Celda con número, montos y dots
    CalendarDayModal.tsx      # Modal de detalle del día
    CalendarLegend.tsx        # Leyenda ● Gastos ● Recurrentes
  pages/
    CalendarPage.tsx          # Ensamblado con lazy loading
```

### Queries de Supabase
```typescript
// 3 queries en paralelo vía Promise.all
expenses:               date entre firstDay y lastDay del mes
recurring_payments:     active = true (todos los activos del usuario)
recurring_payments_log: paid_month = primer día del mes (para isPaid)
```

---

## 🎨 UI/UX

- Grilla responsive con celdas mínimo 60px de alto
- Montos de gastos en verde (#10B981), recurrentes en azul (#3B82F6)
- Día actual: fondo bg-emerald-500/20 + borde border-[#10B981]
- Días de mes anterior/siguiente: opacity-30
- Header inteligente con 4 estados de visualización
- Modal con animación fn-animate-in, cierre por overlay

---

## ⚠️ Notas de implementación

- `due_day` es el campo correcto en `recurring_payments` (no `day_of_month`)
- `active` es el campo correcto (no `is_active`)
- `new Date(\`${day}T12:00:00\`)` para evitar desfases de zona horaria en el modal
- El caché usa `useRef` para no generar re-renders ni loops de dependencias
