# PROTECTED.md — Módulos Bajo Protección

> Este archivo le indica a cualquier agente de IA (Claude Code, Copilot, etc.)
> qué módulos NO deben ser modificados sin instrucción explícita del desarrollador.
>
> Se actualiza a medida que cada feature es implementada y aprobada.

---

## 🔒 Módulos Protegidos

*Este archivo está vacío mientras el proyecto está en fase inicial.*
*Se irá llenando conforme se completen las features.*

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
