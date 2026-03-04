# Feature 005 — Análisis Inteligente de Ahorros
**Proyecto:** Finanzly
**Estado:** 📋 Especificado | ⬜ En desarrollo | ✅ Implementado
**Esfuerzo estimado:** ~25 horas
**Dependencia:** Features 002, 003 y 004 deben estar completas

---

## 📋 Descripción

El cerebro diferenciador de Finanzly. Analiza el historial de gastos del usuario para detectar patrones, anomalías y oportunidades de ahorro reales. No da consejos genéricos — genera recomendaciones basadas en los datos específicos del usuario.

---

## 👤 Historias de Usuario

### US-005-01: Detectar categorías con gasto anómalo
**Como** usuario autenticado
**Quiero** saber en qué categorías estoy gastando más de lo habitual
**Para** tomar acción antes de que se vuelva un problema

**Criterios de aceptación:**
- [ ] Identificar categorías donde el gasto del mes actual supera el promedio personal en >20%
- [ ] Mostrar: categoría, gasto actual, promedio histórico, diferencia en % y monto
- [ ] Ordenadas de mayor a menor anomalía
- [ ] Explicación en texto natural y en español ("Este mes gastaste 35% más en Alimentación que tu promedio")
- [ ] Solo aplica si hay al menos 2 meses de historial

---

### US-005-02: Comparativa mes a mes por categoría
**Como** usuario autenticado
**Quiero** comparar mis gastos por categoría entre el mes actual y el anterior
**Para** ver tendencias en tiempo real

**Criterios de aceptación:**
- [ ] Tabla o tarjetas con: categoría, mes anterior, mes actual, diferencia (↑↓ con color)
- [ ] Ordenable por: categoría, monto actual, variación
- [ ] Resumen de cuántas categorías subieron vs bajaron
- [ ] Gráfica de barras agrupadas (mes anterior vs actual) por categoría

---

### US-005-03: Identificar establecimientos de alto gasto
**Como** usuario autenticado
**Quiero** ver en qué establecimientos concentro más gasto
**Para** tomar decisiones conscientes sobre dónde compro

**Criterios de aceptación:**
- [ ] Top 10 establecimientos por gasto total (último mes y acumulado)
- [ ] Solo aplica cuando hay datos en el campo `establishment`
- [ ] Cada ítem: nombre del establecimiento, total gastado, número de visitas, gasto promedio por visita
- [ ] Si <30% de los gastos tienen establishment, mostrar aviso para motivar el uso del campo

---

### US-005-04: Score de salud financiera
**Como** usuario autenticado
**Quiero** ver un indicador de mi salud financiera mensual
**Para** tener una métrica simple de cómo voy

**Criterios de aceptación:**
- [ ] Score del 0 al 100 calculado mensualmente
- [ ] Visible en el Dashboard (Feature 003) y en la sección de Análisis
- [ ] Explicación de qué factores componen el score
- [ ] Histórico del score de los últimos 6 meses (gráfica de línea)
- [ ] Mensaje motivacional personalizado según el score

---

### US-005-05: Recomendaciones de ahorro
**Como** usuario autenticado
**Quiero** recibir sugerencias concretas de ahorro
**Para** saber exactamente qué puedo hacer diferente

**Criterios de aceptación:**
- [ ] Mínimo 3 recomendaciones activas basadas en patrones detectados
- [ ] Cada recomendación incluye: qué hacer, cuánto podrías ahorrar, en qué categoría
- [ ] Recomendaciones se actualizan mensualmente
- [ ] Ejemplos de recomendaciones:
  - "Gastaste $X en cafeterías este mes. Reducir a 3 visitas/semana te ahorraría ~$Y/mes"
  - "Tu gasto en Entretenimiento subió 40% este mes vs tu promedio"
  - "Tienes 3 suscripciones en Entretenimiento por $X total"

---

## 🏗️ Arquitectura Técnica

### Estructura de archivos
```
src/
  features/
    analysis/
      components/
        AnomalyAlerts.tsx           # Alertas de categorías anómalas
        CategoryComparison.tsx      # Tabla comparativa mes a mes
        TopEstablishments.tsx       # Ranking de establecimientos
        HealthScore.tsx             # Score con histórico
        SavingsRecommendations.tsx  # Lista de recomendaciones
      hooks/
        useAnalysis.ts              # Hook principal que orquesta todo
        useAnomalyDetection.ts      # Lógica de detección de anomalías
        useHealthScore.ts           # Cálculo del score
        useSavingsRecommendations.ts
      lib/
        analysis-engine.ts          # Funciones puras de análisis (testeables)
        score-calculator.ts         # Algoritmo del score
      pages/
        AnalysisPage.tsx
```

### Algoritmo del Score de Salud Financiera
```typescript
// Factores del score (suma = 100 puntos)
const SCORE_FACTORS = {
  consistency: 25,      // ¿Registra gastos regularmente? (días con entradas / días del mes)
  trend: 25,            // ¿Su gasto total bajó vs mes anterior?
  categories: 25,       // ¿Cuántas categorías con anomalía? (menos = mejor)
  recurring: 25,        // ¿Pagó sus recurrentes a tiempo? (del log de Feature 004)
};
```

### Detección de anomalías
```typescript
// Lógica base de detección
function detectAnomalies(currentMonth: CategoryTotal[], historicalAvg: CategoryAverage[]) {
  return currentMonth.filter(current => {
    const avg = historicalAvg.find(h => h.category === current.category);
    if (!avg || avg.monthsOfData < 2) return false;
    const deviation = (current.total - avg.amount) / avg.amount;
    return deviation > 0.20; // >20% sobre el promedio personal
  }).sort((a, b) => b.deviation - a.deviation);
}
```

### Schema de base de datos
```sql
-- Cache de scores mensuales
CREATE TABLE monthly_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month DATE NOT NULL,              -- primer día del mes
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  factors JSONB,                    -- detalle de cada factor
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE monthly_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores"
  ON monthly_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 🎨 UI/UX

- Sección de análisis accesible desde el menú principal con ícono de "cerebro" o "gráfica"
- Score grande y prominente con color (rojo < 40, amarillo 40-70, verde > 70)
- Recomendaciones en formato de "tarjetas de acción" con CTA claro
- Loading states escalonados — mostrar secciones a medida que cargan
- Mensaje de "Necesitas al menos 1 mes de datos para ver análisis" si es usuario nuevo

---

## ⚠️ Riesgos & Consideraciones

- Este módulo es el más complejo y el más valioso — es el diferenciador real de Finanzly frente a apps simples de registro.
- El análisis se hace en el cliente (no en servidor) para los primeros meses — si el volumen de datos crece, migrar a Supabase RPC functions.
- Los algoritmos de recomendación son deterministas (no IA generativa) para mantener costo cero en esta versión.
- Versión futura: integrar LLM (Claude API) para recomendaciones en lenguaje natural más sofisticado.
