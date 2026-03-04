# Finanzly — Constitution
> Principios no negociables que guían todo el desarrollo del proyecto.
> Todo agente de IA y todo desarrollador debe leer este archivo antes de tocar cualquier código.

---

## 🏛️ Identidad del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Finanzly |
| **Tipo** | Web Application (PWA) |
| **Mercado** | Hispanohablantes — LATAM / España |
| **Propósito** | Ayudar a los usuarios a registrar gastos, identificar patrones de consumo y descubrir oportunidades de ahorro |
| **Personalidad de marca** | Inteligente / analítica + Amigable / accesible |
| **URL de producción** | `finanzly.codebylucio.dev` |
| **Plataforma de despliegue** | Cloudflare Pages |

---

## 🛠️ Stack Tecnológico (NO negociable)

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Frontend | Vite + React | Sin Next.js, sin SSR |
| Estilos | Tailwind CSS + DaisyUI | Primero DaisyUI, luego Tailwind para customización |
| Backend / DB | Supabase | Auth + PostgreSQL + Storage |
| Despliegue | Cloudflare Pages | Subdominio: `finanzly.codebylucio.dev` |
| Lenguaje | TypeScript | Obligatorio en todo el proyecto |

---

## 📐 Principios de Arquitectura

1. **Specs primero** — Ningún feature se implementa sin una especificación aprobada en `.speckit/features/`.
2. **Componentes pequeños** — Cada componente hace una sola cosa. Máximo 150 líneas por archivo.
3. **Separación de responsabilidades** — Lógica de negocio separada de la UI. Custom hooks para lógica, componentes para presentación.
4. **Supabase como única fuente de verdad** — No se duplica estado que ya existe en la base de datos sin justificación.
5. **Sin over-engineering** — YAGNI. No se construye lo que no está en la spec actual.

---

## 🔐 Seguridad (Obligatorio)

- **Nunca** exponer claves de Supabase en el frontend más allá de la `anon key` pública.
- **Siempre** usar Row Level Security (RLS) en todas las tablas de Supabase.
- **Siempre** validar inputs del usuario tanto en frontend como en reglas de Supabase.
- Autenticación manejada exclusivamente por Supabase Auth.
- Variables de entorno en `.env.local`, nunca hardcodeadas.

---

## 🎨 Diseño & UX

- **Mobile-first** — Todos los componentes se diseñan primero para móvil.
- **Dark y Light mode** soportados desde el día uno vía DaisyUI themes.
- **Español** como idioma principal de la interfaz.
- Accesibilidad básica: atributos `aria-label`, contraste WCAG AA mínimo.
- Feedback visual siempre presente: loading states, error states, empty states.

---

## 🚫 Código Protegido

> Cuando se adopte el CLI de Spec-Kit en fases avanzadas, el agente NO debe modificar
> los módulos marcados como `[PROTEGIDO]` sin instrucción explícita del desarrollador.

Los módulos se marcarán como protegidos una vez implementados y aprobados.
Consultar el archivo `PROTECTED.md` en la raíz del proyecto.

---

## 📦 Convenciones de Código

```
src/
  components/       # Componentes reutilizables (UI puro)
  features/         # Módulos por feature (auth, expenses, dashboard...)
  hooks/            # Custom hooks globales
  lib/              # Clientes externos (supabase, utils)
  types/            # TypeScript types e interfaces globales
  pages/            # Vistas principales (una por ruta)
```

- Nombres de componentes: `PascalCase`
- Nombres de hooks: `camelCase` con prefijo `use`
- Nombres de archivos: `kebab-case`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)

---

## ✅ Definition of Done

Un feature está **terminado** cuando:
- [ ] Cumple todos los criterios de aceptación de su spec
- [ ] Funciona en móvil y desktop
- [ ] Maneja correctamente los estados: loading, error y vacío
- [ ] RLS habilitado en las tablas involucradas
- [ ] No rompe ningún feature previo
- [ ] Commiteado con mensaje descriptivo
