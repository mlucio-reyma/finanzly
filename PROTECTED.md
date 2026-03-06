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
