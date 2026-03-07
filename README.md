<div align="center">

# 💚 Finanzly

**Tu dinero, bajo control.**

Una PWA de finanzas personales diseñada para hispanohablantes — rápida, inteligente y completamente gratuita.

[![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange?style=flat-square&logo=cloudflare)](https://finanzly.codebylucio.dev)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Supabase-blue?style=flat-square&logo=react)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[🚀 Demo en vivo](https://finanzly.codebylucio.dev) · [📋 Roadmap](#-roadmap) · [🤝 Contribuir](#-contribuir)

</div>

---

## ¿Qué es Finanzly?

Finanzly es una aplicación web progresiva (PWA) para el control de finanzas personales, pensada desde el primer día para usuarios de LATAM y España. No es solo un registro de gastos — es un asistente financiero que detecta patrones en tu consumo y te dice exactamente dónde puedes ahorrar.

> **Sin suscripciones. Sin publicidad. Sin datos en manos de terceros.**

---

## ✨ Features

### 🔐 Autenticación segura
- Registro e inicio de sesión con email/contraseña
- Recuperación de contraseña por email
- Sesión persistente entre visitas
- Rutas protegidas — tus datos solo son tuyos

### 💸 Gestión de Gastos
- Registra gastos con categoría, establecimiento, método de pago y descripción
- 12 categorías predefinidas con íconos (🍔 Alimentación, 🏠 Vivienda, 🚗 Transporte, y más)
- Filtros combinables: rango de fechas, categoría y método de pago
- Edición y eliminación con confirmación
- Paginación del lado del servidor — sin límite de historial

### 📊 Dashboard interactivo
- **Resumen del mes**: total gastado, promedio diario, número de transacciones
- **Tendencia vs. mes anterior**: indicador ↑↓ con variación porcentual
- **Donut chart**: desglose visual del top 5 categorías del mes
- **Bar chart**: evolución de los últimos 6 meses
- **Gastos recientes**: tus últimas 5 transacciones con fecha relativa

### 🔁 Pagos Recurrentes
- Registra suscripciones y compromisos fijos mensuales (Netflix, renta, gym...)
- Total mensual comprometido visible de un vistazo
- Marcado de pagos como "ya pagado" — crea el gasto en tu historial automáticamente
- Recordatorios por email configurables: 1, 2, 3, 5 o 7 días antes del vencimiento
- Toggle activo/inactivo para pausar sin perder el registro

### 🏷️ Categorías Personalizadas
- Crea tus propias categorías con nombre, emoji y color
- Activa o desactiva categorías sin perder el registro
- Las categorías activas aparecen en el formulario de gastos junto a las 12 predefinidas
- Vista de administración con lista colapsable de categorías del sistema

### 🧠 Análisis Inteligente
- **Score de salud financiera** (0–100) calculado mensualmente con histórico de 6 meses
- **Detección de anomalías**: categorías donde gastas >20% más que tu promedio histórico
- **Comparativa mes a mes**: variación por categoría con indicadores visuales
- **Top establecimientos**: los lugares donde más gastas, cuántas veces vas y cuánto dejas por visita
- **Recomendaciones personalizadas**: sugerencias concretas basadas en tus patrones reales

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Frontend | React 18 + Vite | Velocidad de desarrollo, HMR instantáneo |
| Lenguaje | TypeScript (strict) | Seguridad de tipos en todo el proyecto |
| Estilos | Tailwind CSS + DaisyUI | Utilidades + componentes sin reinventar la rueda |
| Backend / DB | Supabase | Auth + PostgreSQL + RLS en una sola plataforma |
| Gráficas | Recharts | Responsive, composable, compatible con React |
| Deploy | Cloudflare Pages | Edge global, gratis, SSL automático |

---

## 🚀 Instalación local

### Prerequisitos

- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com) (gratuita)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/finanzly.git
cd finanzly
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

> ⚠️ **Nunca** expongas la `service_role` key en el frontend.

### 4. Configurar Supabase

Ejecuta los siguientes scripts SQL en el **SQL Editor** de tu proyecto de Supabase:

<details>
<summary>📄 Ver schema completo de base de datos</summary>

```sql
-- Tabla de perfiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger para crear profile al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Tabla de gastos
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

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own recurring payments"
  ON recurring_payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Log de pagos realizados
CREATE TABLE recurring_payments_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_payment_id UUID REFERENCES recurring_payments(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  paid_month DATE NOT NULL,
  expense_id UUID REFERENCES expenses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurring_payment_id, paid_month)
);

ALTER TABLE recurring_payments_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own recurring log"
  ON recurring_payments_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabla de categorías personalizadas
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

-- Cache de scores mensuales
CREATE TABLE monthly_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month DATE NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE monthly_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores"
  ON monthly_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

</details>

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables (Navigation, ProtectedRoute...)
├── features/
│   ├── auth/            # Registro, login, recuperación de contraseña
│   ├── expenses/        # CRUD de gastos, filtros, lista
│   ├── dashboard/       # Gráficas, métricas, resumen del mes
│   ├── recurring/       # Pagos recurrentes y recordatorios
│   ├── analysis/        # Score, anomalías, recomendaciones
│   └── categories/      # CRUD de categorías personalizadas
├── lib/                 # Cliente de Supabase, utilidades
└── types/               # TypeScript types globales, categorías
```

Cada feature sigue el patrón:

```
feature/
  components/   # UI pura
  hooks/        # Lógica de negocio y acceso a datos
  pages/        # Vistas (una por ruta)
```

---

## 📐 Principios de desarrollo

- **Mobile-first** — Todo se diseña primero para móvil.
- **Specs primero** — Ningún feature se toca sin una spec aprobada en `.speckit/features/`.
- **Componentes pequeños** — Máximo ~150 líneas por archivo.
- **Supabase como fuente de verdad** — Row Level Security en todas las tablas.
- **Sin over-engineering** — YAGNI. Solo se construye lo que está en la spec.

---

## 🗺️ Roadmap

| Feature | Estado |
|---------|--------|
| ✅ Autenticación completa | Implementado |
| ✅ Gestión de gastos (CRUD + filtros) | Implementado |
| ✅ Dashboard con visualizaciones | Implementado |
| ✅ Pagos recurrentes | Implementado |
| ✅ Análisis inteligente (score + anomalías + recomendaciones) | Implementado |
| ✅ Categorías personalizadas (CRUD + emoji + color) | Implementado |
| 🔜 Recordatorios por email (Edge Functions) | Próximo |
| 🔜 Exportar historial a CSV/PDF | Planeado |
| 🔜 Modo multi-moneda (MXN, ARS, CLP, EUR...) | Planeado |
| 🔜 Metas de ahorro | Planeado |
| 🔜 Integración con Claude API para recomendaciones avanzadas | Futuro |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Antes de abrir un PR, lee el flujo recomendado:

1. **Abre un issue** describiendo el bug o la mejora.
2. **Fork** el repositorio y crea una rama descriptiva:
   ```bash
   git checkout -b feat/nombre-del-feature
   ```
3. **Sigue las convenciones** de commits (Conventional Commits):
   - `feat:` nueva funcionalidad
   - `fix:` corrección de bug
   - `chore:` mantenimiento
   - `docs:` documentación
4. **Abre tu PR** con descripción clara de qué cambia y por qué.

> Si planeas trabajar en un feature grande, revisa `.speckit/features/` para entender las specs existentes y evitar trabajo duplicado.

---

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en **todas** las tablas — ningún usuario puede acceder a datos de otro.
- Solo se usa la `anon key` pública de Supabase en el frontend.
- Variables de entorno en `.env.local`, nunca commiteadas.
- Inputs validados tanto en frontend como en las reglas de Supabase.

Si encuentras una vulnerabilidad de seguridad, por favor repórtala abriendo un issue privado en lugar de hacerlo público.

---

## 📄 Licencia

Distribuido bajo licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con 💚 para LATAM y España**

[finanzly.codebylucio.dev](https://finanzly.codebylucio.dev)

</div>
