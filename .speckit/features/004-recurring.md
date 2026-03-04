# Feature 004 — Pagos Recurrentes & Recordatorios
**Proyecto:** Finanzly
**Estado:** 📋 Especificado | ⬜ En desarrollo | ✅ Implementado
**Esfuerzo estimado:** ~12 horas
**Dependencia:** Feature 002 (Gastos) debe estar completa

---

## 📋 Descripción

Módulo para gestionar suscripciones y pagos fijos mensuales. El usuario registra sus compromisos financieros recurrentes (Netflix, renta, gym, seguros, etc.) y recibe recordatorios por email antes de su fecha de vencimiento. Ayuda a visualizar el total mensual "comprometido" antes de analizar gastos variables.

---

## 👤 Historias de Usuario

### US-004-01: Registrar pago recurrente
**Como** usuario autenticado
**Quiero** registrar mis pagos fijos mensuales
**Para** tener control de mis compromisos financieros

**Criterios de aceptación:**
- [ ] Formulario con: nombre, monto, día de vencimiento, categoría, días de recordatorio, estado activo/inactivo
- [ ] Día de vencimiento: número del 1 al 31
- [ ] Días de recordatorio: 1, 2, 3, 5 o 7 días antes (selector)
- [ ] Toggle activo/inactivo para pausar sin eliminar
- [ ] Confirmación visual tras guardar

---

### US-004-02: Ver lista de pagos recurrentes
**Como** usuario autenticado
**Quiero** ver todos mis pagos recurrentes en un solo lugar
**Para** conocer mis compromisos mensuales totales

**Criterios de aceptación:**
- [ ] Lista ordenada por día de vencimiento (próximo a vencer primero)
- [ ] Cada ítem: nombre, monto, día de vencimiento, categoría, estado
- [ ] Total mensual comprometido visible en la parte superior
- [ ] Indicador visual si el pago vence en los próximos 3 días
- [ ] Badge "PAUSADO" en pagos inactivos
- [ ] Estado vacío ilustrado si no hay pagos registrados

---

### US-004-03: Marcar pago como pagado
**Como** usuario autenticado
**Quiero** marcar un pago recurrente como pagado este mes
**Para** llevar control de qué ya pagué en el mes actual

**Criterios de aceptación:**
- [ ] Checkbox o botón "Marcar como pagado" en cada ítem
- [ ] El registro automáticamente crea un gasto en la Feature 002
- [ ] El gasto creado toma: monto, categoría y nombre del pago recurrente
- [ ] El estado "pagado" se resetea automáticamente al inicio del siguiente mes
- [ ] Confirmación visual al marcar como pagado

---

### US-004-04: Recibir recordatorio por email
**Como** usuario autenticado
**Quiero** recibir un email antes de que venza un pago
**Para** no olvidar pagos importantes

**Criterios de aceptación:**
- [ ] Email enviado X días antes del vencimiento (según configuración del pago)
- [ ] Email incluye: nombre del pago, monto, fecha exacta de vencimiento
- [ ] Email enviado solo para pagos activos
- [ ] Email no se envía si el pago ya fue marcado como pagado ese mes
- [ ] El email debe estar en español y con branding de Finanzly

---

## 🏗️ Arquitectura Técnica

### Estructura de archivos
```
src/
  features/
    recurring/
      components/
        RecurringForm.tsx         # Formulario crear/editar
        RecurringList.tsx         # Lista de pagos recurrentes
        RecurringItem.tsx         # Ítem individual
        MonthlyCommittedCard.tsx  # Tarjeta con total mensual
      hooks/
        useRecurring.ts           # CRUD de pagos recurrentes
        useMarkAsPaid.ts          # Lógica de marcar como pagado
      pages/
        RecurringPage.tsx
```

### Schema de base de datos
```sql
-- Tabla de pagos recurrentes
CREATE TABLE recurring_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  category TEXT NOT NULL,
  reminder_days INTEGER DEFAULT 3,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos realizados por mes
CREATE TABLE recurring_payments_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_payment_id UUID REFERENCES recurring_payments(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  paid_month DATE NOT NULL,           -- primer día del mes: 2026-03-01
  expense_id UUID REFERENCES expenses(id),  -- gasto creado automáticamente
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurring_payment_id, paid_month)  -- un pago por mes
);

-- RLS en ambas tablas
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_payments_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own recurring payments"
  ON recurring_payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own recurring log"
  ON recurring_payments_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Sistema de notificaciones por email
**Implementación con Supabase Edge Functions + pg_cron:**

```
Supabase Edge Function: send-recurring-reminders
  - Se ejecuta diariamente a las 9:00 AM (hora del usuario)
  - Consulta pagos recurrentes activos cuyo due_day = hoy + reminder_days
  - Verifica que no estén en recurring_payments_log del mes actual
  - Envía email via Resend o SendGrid
  - Template del email en español con branding Finanzly
```

**Variables de entorno necesarias:**
```
RESEND_API_KEY=
FINANZLY_FROM_EMAIL=noreply@finanzly.codebylucio.dev
```

---

## 🎨 UI/UX

- Cards por pago con indicador de color: verde (pagado), amarillo (próximo), rojo (vencido hoy)
- En móvil: swipe derecho para "marcar como pagado"
- Animación de check al marcar como pagado
- El total mensual comprometido se muestra también en el Dashboard (Feature 003)

---

## ⚠️ Riesgos & Consideraciones

- Los Edge Functions de Supabase tienen un cold start — el cron job de recordatorios debe contemplar esto.
- El manejo de zonas horarias es crítico para los recordatorios — almacenar la zona horaria del usuario en `profiles`.
- Días 29, 30 y 31 en meses cortos (febrero): manejar con lógica de "último día del mes" como fallback.
- Configurar dominio de email verificado en Resend/SendGrid para evitar spam.
