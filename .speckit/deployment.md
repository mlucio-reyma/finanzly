# Finanzly — Despliegue & Infraestructura
**Proyecto:** Finanzly
**Plataforma:** Cloudflare Pages
**Dominio:** finanzly.codebylucio.dev

---

## 🌐 URLs

| Entorno | URL | Notas |
|---------|-----|-------|
| Producción | `https://finanzly.codebylucio.dev` | Subdominio del dominio principal |
| Preview | `https://finanzly-preview.pages.dev` | Auto-generado por Cloudflare en PRs |
| Desarrollo | `http://localhost:5173` | Vite dev server |

---

## ☁️ Cloudflare Pages — Configuración

### Setup inicial
1. Conectar repositorio de GitHub a Cloudflare Pages
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Node.js version: `20`

### Variables de entorno en Cloudflare
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
> ⚠️ Agregar estas variables en el panel de Cloudflare Pages > Settings > Environment variables

### Subdominio personalizado
1. En Cloudflare Dashboard → tu dominio `codebylucio.dev`
2. DNS → Agregar registro CNAME:
   - Nombre: `finanzly`
   - Destino: `<project-name>.pages.dev`
   - Proxy: ✅ Activado (naranja)
3. En Cloudflare Pages → Custom domains → Agregar `finanzly.codebylucio.dev`

---

## 🔧 Supabase — Configuración de producción

### URLs de redirect autorizadas
En Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://finanzly.codebylucio.dev
Redirect URLs:
  - https://finanzly.codebylucio.dev/**
  - http://localhost:5173/**
```

### Edge Functions (Feature 004 — Recordatorios)
```
Función: send-recurring-reminders
Cron: 0 15 * * *    # 9:00 AM UTC-6 (hora de México)
```

---

## 📦 Scripts de build

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🔄 Flujo de CI/CD

```
Push a main
  → Cloudflare Pages detecta el push
  → Ejecuta: npm run build
  → Deploy automático a finanzly.codebylucio.dev
  → Notificación de deploy exitoso/fallido

Pull Request
  → Cloudflare Pages genera preview URL automática
  → Preview disponible para review antes de merge
```

---

## 🗂️ Estructura del repositorio recomendada

```
finanzly/
  .speckit/                 # Documentación SDD
    constitution.md
    specs/
      product-spec.md
    features/
      001-auth.md
      002-expenses.md
      003-dashboard.md
      004-recurring.md
      005-savings-analysis.md
    deployment.md
  src/                      # Código fuente
  public/                   # Assets estáticos
  .env.local                # Variables locales (no commitear)
  .env.example              # Template de variables (sí commitear)
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  PROTECTED.md              # Módulos protegidos (se llena durante dev)
```

---

## ✅ Checklist de deploy a producción

- [ ] Variables de entorno configuradas en Cloudflare Pages
- [ ] Supabase URLs de redirect actualizadas con dominio de producción
- [ ] RLS habilitado en todas las tablas
- [ ] Email templates en español configurados en Supabase
- [ ] Dominio DNS configurado y propagado
- [ ] Build de producción sin errores TypeScript
- [ ] Test manual de flujo completo en preview URL antes de merge a main
