# Feature 003 — Dashboard & Visualizaciones
**Proyecto:** Finanzly
**Estado:** 📋 Especificado | ⬜ En desarrollo | ✅ Implementado
**Esfuerzo estimado:** ~18 horas
**Dependencia:** Feature 002 (Gastos) debe estar completa

---

## 📋 Descripción

Vista principal de Finanzly. El dashboard es la primera pantalla que ve el usuario al iniciar sesión y debe comunicar el estado financiero del mes de un vistazo. Combina métricas clave con visualizaciones interactivas.

---

## 👤 Historias de Usuario

### US-003-01: Resumen del mes actual
**Como** usuario autenticado
**Quiero** ver cuánto he gastado este mes de un vistazo
**Para** saber en qué punto estoy financieramente

**Criterios de aceptación:**
- [ ] Total gastado en el mes actual (número grande y prominente)
- [ ] Comparación porcentual vs. mes anterior (↑ +12% / ↓ -8%)
- [ ] Gasto diario promedio del mes actual
- [ ] Número de transacciones del mes
- [ ] Indicador visual de tendencia (verde si baja, rojo si sube)

---

### US-003-02: Desglose por categoría
**Como** usuario autenticado
**Quiero** ver en qué categorías concentro mis gastos
**Para** identificar dónde puedo optimizar

**Criterios de aceptación:**
- [ ] Gráfica de dona (donut chart) con las categorías del mes
- [ ] Top 5 categorías con monto y porcentaje del total
- [ ] Al tocar/hover una categoría, mostrar detalle del monto
- [ ] Colores consistentes por categoría en toda la app
- [ ] Estado vacío si no hay datos del mes

---

### US-003-03: Tendencia mensual
**Como** usuario autenticado
**Quiero** ver cómo han evolucionado mis gastos en los últimos meses
**Para** identificar tendencias en mi comportamiento financiero

**Criterios de aceptación:**
- [ ] Gráfica de barras con los últimos 6 meses
- [ ] Barra del mes actual diferenciada visualmente
- [ ] Eje Y con montos formateados (ej: $1.2k, $3.5k)
- [ ] Tooltip con monto exacto al hover/tap
- [ ] Responsive: se adapta al ancho de pantalla

---

### US-003-04: Gastos recientes
**Como** usuario autenticado
**Quiero** ver mis últimos gastos en el dashboard
**Para** tener contexto reciente sin ir al historial completo

**Criterios de aceptación:**
- [ ] Lista de los últimos 5 gastos
- [ ] Cada ítem: emoji categoría + descripción/establecimiento + monto + fecha relativa ("Hoy", "Ayer", "Hace 3 días")
- [ ] Tap en un ítem lleva al detalle/edición del gasto
- [ ] Link "Ver todos" que lleva a la página de historial

---

## 🏗️ Arquitectura Técnica

### Estructura de archivos
```
src/
  features/
    dashboard/
      components/
        MonthSummaryCard.tsx      # Tarjeta de resumen del mes
        CategoryDonutChart.tsx    # Gráfica de dona
        MonthlyBarChart.tsx       # Gráfica de barras mensual
        RecentExpensesList.tsx    # Últimos 5 gastos
        TrendIndicator.tsx        # Indicador ↑↓ con color
      hooks/
        useDashboardData.ts       # Agrega todas las queries del dashboard
        useMonthSummary.ts        # Totales del mes actual vs anterior
        useCategoryBreakdown.ts   # Agrupación por categoría
        useMonthlyTrend.ts        # Datos de los últimos 6 meses
      pages/
        DashboardPage.tsx
```

### Queries de Supabase
```typescript
// Resumen del mes - suma total
const { data } = await supabase
  .from('expenses')
  .select('amount')
  .eq('user_id', userId)
  .gte('date', startOfMonth)
  .lte('date', endOfMonth);

// Agrupación por categoría - usar RPC o procesar en cliente
// para los primeros meses (volumen bajo), calcular en cliente

// Tendencia mensual - últimos 6 meses agrupados
// Implementar como Supabase RPC function para eficiencia
```

### Librería de gráficas
**Recharts** — elegida por:
- Compatible con React y TypeScript
- Responsive nativo
- Customizable con Tailwind
- Bundle size razonable (~150kb)

```typescript
import { PieChart, Pie, BarChart, Bar, ... } from 'recharts';
```

---

## 🎨 UI/UX

- Layout en grid: métricas arriba, gráficas en el centro, recientes abajo
- En móvil: layout en columna única con scroll
- En desktop: layout de 2 columnas para las gráficas
- Skeleton loaders para cada sección independientemente
- Pull-to-refresh en móvil para actualizar datos
- Números en formato de moneda local (MXN / CLP / ARS según locale)

---

## ⚠️ Riesgos & Consideraciones

- Las queries de agrupación pueden ser costosas — considerar memoización con `useMemo` y limitar re-renders.
- Para la Feature 005 (Análisis), estas mismas queries serán reutilizadas. Diseñar `useDashboardData` pensando en composición.
- Recharts puede tener problemas de renderizado en algunos Safari móviles — testear en iOS.
