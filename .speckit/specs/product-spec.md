# Finanzly — Especificación General del Producto

> **Fuente de verdad del producto.** Este documento define qué construimos y por qué.
> Última actualización: 2026-03

---

## 🎯 Visión del Producto

**Finanzly** es una aplicación web para hispanohablantes que quieren tomar control de sus finanzas personales sin complicaciones. No es una herramienta de inversión ni de contabilidad empresarial — es el compañero financiero cotidiano que te ayuda a entender en qué gastas, detectar patrones y encontrar oportunidades de ahorro reales.

---

## 👤 Usuario Objetivo

- Personas de 22–40 años en LATAM / España
- Con ingresos medios, preocupadas por sus gastos pero sin hábito financiero consolidado
- Usan el celular como dispositivo principal
- Quieren claridad, no complejidad

---

## 🗺️ Features del Producto

### Feature 001 — Autenticación & Seguridad
**Estado:** 📋 Especificado

Permite a los usuarios crear cuenta, iniciar sesión y gestionar su perfil de forma segura.

**Historias de usuario:**
- Como usuario nuevo, quiero registrarme con email y contraseña para crear mi cuenta.
- Como usuario registrado, quiero iniciar sesión para acceder a mis datos.
- Como usuario, quiero poder recuperar mi contraseña si la olvido.
- Como usuario, quiero cerrar sesión desde cualquier dispositivo.

**Criterios de aceptación:**
- Registro con email + contraseña (mínimo 8 caracteres)
- Login con feedback claro de errores
- Recuperación de contraseña por email
- Sesión persistente con refresh token de Supabase
- Redirección automática si ya hay sesión activa
- Protección de rutas privadas

---

### Feature 002 — Gestión de Gastos
**Estado:** 📋 Especificado

CRUD completo de gastos. El corazón de la aplicación.

**Historias de usuario:**
- Como usuario, quiero registrar un gasto con monto, categoría, fecha y descripción.
- Como usuario, quiero identificar el establecimiento donde realicé el gasto.
- Como usuario, quiero editar un gasto registrado si cometí un error.
- Como usuario, quiero eliminar gastos.
- Como usuario, quiero ver mi historial de gastos con filtros.

**Campos del gasto:**
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| amount | decimal | ✅ | Positivo, máx 2 decimales |
| category | enum | ✅ | Ver lista de categorías |
| date | date | ✅ | Default: hoy |
| description | string | ❌ | Máx 200 chars |
| establishment | string | ❌ | Tienda/restaurante/servicio |
| payment_method | enum | ❌ | efectivo, débito, crédito, transferencia |

**Categorías:**
- 🍔 Alimentación
- 🏠 Vivienda
- 🚗 Transporte / Gas
- 💊 Salud
- 🎮 Entretenimiento
- 👕 Ropa
- 📚 Educación
- 💼 Trabajo
- 🐾 Mascotas
- 🎁 Regalos
- 💳 Deudas / Créditos
- 📦 Otros

---

### Feature 003 — Dashboard & Visualizaciones
**Estado:** 📋 Especificado

Vista principal con resumen financiero y gráficas de análisis.

**Historias de usuario:**
- Como usuario, quiero ver cuánto he gastado este mes de un vistazo.
- Como usuario, quiero ver un desglose visual de mis gastos por categoría.
- Como usuario, quiero comparar mis gastos entre meses.
- Como usuario, quiero ver mis gastos más recientes en el dashboard.

**Componentes del dashboard:**
- Resumen del mes actual (total gastado, comparación vs mes anterior)
- Gráfica de dona por categoría
- Gráfica de barras mensual (últimos 6 meses)
- Lista de últimos 5 gastos
- Indicador de gasto diario promedio

---

### Feature 004 — Pagos Recurrentes & Recordatorios
**Estado:** 📋 Especificado

Gestión de suscripciones y pagos fijos con notificaciones por email.

**Historias de usuario:**
- Como usuario, quiero registrar mis pagos recurrentes (Netflix, renta, gimnasio...).
- Como usuario, quiero recibir un recordatorio por email antes de que venza un pago.
- Como usuario, quiero marcar un pago recurrente como pagado en el mes actual.
- Como usuario, quiero ver el total mensual comprometido en pagos fijos.

**Campos del pago recurrente:**
| Campo | Tipo | Notas |
|-------|------|-------|
| name | string | Nombre del servicio |
| amount | decimal | Monto mensual |
| due_day | integer | Día del mes (1-31) |
| category | enum | Mismas categorías de gastos |
| reminder_days | integer | Días antes para notificar (default: 3) |
| active | boolean | Para pausar sin eliminar |

---

### Feature 005 — Análisis Inteligente de Ahorros
**Estado:** 📋 Especificado

Motor de detección de patrones y recomendaciones personalizadas.

**Historias de usuario:**
- Como usuario, quiero saber en qué categoría gasto más de lo habitual.
- Como usuario, quiero recibir sugerencias concretas de ahorro basadas en mis datos.
- Como usuario, quiero ver si mis gastos en una categoría aumentaron respecto al mes anterior.

**Análisis implementados:**
- Detección de categorías con gasto anómalo (>20% sobre promedio personal)
- Comparativa mes a mes por categoría
- Identificación de establecimientos frecuentes con gasto alto
- Score de salud financiera mensual (0–100)
- Recomendaciones textuales basadas en patrones detectados

---

## 🚀 Despliegue

| Entorno | URL | Plataforma |
|---------|-----|-----------|
| Producción | `finanzly.codebylucio.dev` | Cloudflare Pages |
| Desarrollo | `localhost:5173` | Vite dev server |

**Dominio principal:** `codebylucio.dev`
**Subdominio de la app:** `finanzly.codebylucio.dev`
**Configuración DNS:** CNAME en Cloudflare apuntando a Pages deployment

---

## 📅 Plan de Implementación (8 semanas)

| Semana | Feature | Esfuerzo estimado |
|--------|---------|------------------|
| 1 | Setup base + Feature 001 Auth | ~7 hrs |
| 2–3 | Feature 002 Gestión de Gastos | ~15 hrs |
| 4–5 | Feature 003 Dashboard | ~18 hrs |
| 6 | Feature 004 Recurrentes | ~12 hrs |
| 7–8 | Feature 005 Análisis Inteligente | ~25 hrs |
