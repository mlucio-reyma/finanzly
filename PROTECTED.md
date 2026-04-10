# PROTECTED.md — Módulos Bajo Protección

> Este archivo le indica a cualquier agente de IA (Claude Code, Copilot, etc.)
> qué módulos NO deben ser modificados sin instrucción explícita del desarrollador.
>
> Se actualiza a medida que cada feature es implementada y aprobada.

---

## 🔒 Módulos Protegidos

### Feature 001 — Auth [PROTEGIDO]
**Completado:** 2026-03-05
**Archivos protegidos:**
- src/features/auth/**
- src/components/ProtectedRoute.tsx
- src/lib/supabase.ts
- src/lib/database.types.ts
**Notas:** Implementado y probado. Login, registro y rutas protegidas funcionando. No modificar sin revisión explícita.

### Feature 002 — Gestión de Gastos [PROTEGIDO]
**Completado:** 2026-03-06
**Archivos protegidos:**
- src/features/expenses/**
- src/lib/database.types.ts
**Notas:** CRUD completo funcionando. Tabla expenses en Supabase con RLS activo. No modificar sin revisión explícita.

### Feature 003 — Dashboard & Visualizaciones [PROTEGIDO]
**Completado:** 2026-03-06
**Archivos protegidos:**
- src/features/dashboard/**
**Notas:** Dashboard completo con gráficas Recharts funcionando. No modificar sin revisión explícita.

### Feature 004 — Pagos Recurrentes [PROTEGIDO]
**Completado:** 2026-03-06
**Archivos protegidos:**
- src/features/recurring/**
**Notas:** CRUD completo funcionando. Tablas recurring_payments y recurring_payments_log en Supabase con RLS activo. No modificar sin revisión explícita.

### Feature 005 — Análisis Inteligente [PROTEGIDO]
**Completado:** 2026-03-06
**Archivos protegidos:**
- src/features/analysis/**
**Notas:** Motor de análisis, score de salud financiera y recomendaciones funcionando. No modificar sin revisión explícita.

### Feature 006 — Categorías CRUD [PROTEGIDO]
**Completado:** 2026-03-06
**Archivos protegidos:**
- src/features/categories/**
- src/types/categories.ts
**Notas:** CRUD completo con emoji picker y color picker. Tabla custom_categories en Supabase con RLS activo. Integrada con ExpenseForm vía allCategories. No modificar sin revisión explícita.

### Rediseño Visual [PROTEGIDO]
**Estado:** Completo y verificado
**Archivos protegidos:**
- `tailwind.config.js`
- `src/index.css`
- `index.html`

### Feature 007 — Perfil de Usuario [PROTEGIDO]
**Estado:** Completo y verificado
**Archivos protegidos:**
- `src/features/profile/**`
- `src/components/Navigation.tsx`

### Feature 009 — Vista de Calendario [PROTEGIDO]
**Estado:** ✅ Implementado y validado
**Archivos protegidos:**
- `src/features/calendar/types/calendar.types.ts`
- `src/features/calendar/hooks/useCalendarData.ts`
- `src/features/calendar/components/CalendarHeader.tsx`
- `src/features/calendar/components/CalendarDayCell.tsx`
- `src/features/calendar/components/CalendarDayModal.tsx`
- `src/features/calendar/components/CalendarLegend.tsx`
- `src/features/calendar/pages/CalendarPage.tsx`

### Feature 010: Chat con IA Financiera

**Ubicación:** `src/features/chat/`, `src/lib/ai-chat.ts`

**Archivos protegidos:**
- `src/lib/ai-chat.ts` - Cliente de API para n8n webhook
- `src/features/chat/types.ts` - Tipos TypeScript del chat
- `src/features/chat/hooks/useChatContext.ts` - Hook para obtener contexto financiero
- `src/features/chat/hooks/useChat.ts` - Hook principal del chat
- `src/features/chat/components/Message.tsx` - Componente de mensaje
- `src/features/chat/components/TypingIndicator.tsx` - Indicador de escritura
- `src/features/chat/components/QuickActions.tsx` - Sugerencias rápidas
- `src/features/chat/components/ChatDrawer.tsx` - Panel lateral del chat
- `src/features/chat/components/ChatWidget.tsx` - Botón flotante (deprecado)

**Modificados:**
- `src/components/Navigation.tsx` - Añadido ícono de chat en header y estado del drawer
- `.env.local` - Variable VITE_N8N_WEBHOOK_CHAT

**Razón:** Feature completo de chat con IA financiera. No modificar sin revisar spec en `.speckit/features/010-chat-ai.md`

---

## 📋 Template (copiar al completar cada feature)

```
### Feature 001 — Auth [PROTEGIDO]
**Completado:** YYYY-MM-DD
**Rutas protegidas:**
- src/features/auth/**
- src/components/ProtectedRoute.tsx
- src/lib/supabase.ts
**Notas:** Implementado manualmente. No modificar sin revisión.
```

---

## ⚠️ Instrucción para agentes IA

Antes de modificar cualquier archivo marcado en este documento, detente y
solicita confirmación explícita al desarrollador. Los módulos aquí listados
han sido probados y aprobados. Cualquier modificación podría romper features
dependientes.
