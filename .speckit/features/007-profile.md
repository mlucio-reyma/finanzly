# Feature 007 — Perfil de Usuario
**Proyecto:** Finanzly
**Estado:** ✅ Implementado
**Esfuerzo estimado:** ~4 horas
**Dependencia:** Feature 001 (Auth) debe estar completa

---

## 📋 Descripción

Módulo para que el usuario visualice y edite su perfil personal: nombre completo, foto de avatar y moneda preferida. La moneda seleccionada se aplica globalmente en la app (dashboard, gastos). El avatar se almacena en Supabase Storage (bucket `avatars`). La tabla `profiles` se crea automáticamente con valores default la primera vez que el usuario accede.

---

## 👤 Historias de Usuario

### US-007-01: Ver y editar perfil
**Como** usuario autenticado
**Quiero** ver y editar mi información personal
**Para** personalizar mi experiencia en la app

**Criterios de aceptación:**
- [x] Página `/profile` accesible desde la navegación
- [x] Muestra nombre completo, email (solo lectura) y moneda preferida
- [x] El email tiene badge "No editable"
- [x] Botón "Guardar cambios" con feedback de éxito o error
- [x] Si no existe perfil, se crea automáticamente con `currency: 'MXN'`, `currency_symbol: '$'`

---

### US-007-02: Subir foto de perfil
**Como** usuario autenticado
**Quiero** subir una foto de perfil
**Para** personalizar mi cuenta visualmente

**Criterios de aceptación:**
- [x] Círculo de 96px con avatar actual o iniciales del nombre (bg emerald)
- [x] Si no hay nombre, muestra ícono User de lucide-react
- [x] Overlay "Cambiar foto" al hacer hover
- [x] Acepta: image/jpeg, image/png, image/webp — máximo 2 MB
- [x] Validación de tamaño antes de subir con mensaje de error
- [x] Indicador de loading durante la subida
- [x] URL con timestamp `?t=...` para forzar refresco del navegador
- [x] Estado local actualizado inmediatamente tras subida exitosa

---

### US-007-03: Seleccionar moneda preferida
**Como** usuario autenticado
**Quiero** elegir mi moneda preferida
**Para** que los montos se muestren en mi divisa local

**Criterios de aceptación:**
- [x] Selector con las 19 monedas de la tabla `supported_currencies`
- [x] Formato de cada opción: `"MXN — Peso mexicano ($)"`
- [x] Al cambiar moneda, `currency_symbol` se actualiza automáticamente en el guardado
- [x] El dashboard usa el símbolo de moneda del perfil (no hardcodeado)

---

### US-007-04: Acceder al perfil desde la navegación
**Como** usuario autenticado
**Quiero** acceder a mi perfil fácilmente
**Para** poder editarlo en cualquier momento

**Criterios de aceptación:**
- [x] Desktop: enlace "Perfil" con ícono User en sidebar, justo antes de "Cerrar sesión"
- [x] Mobile: ícono de avatar/usuario en el header superior derecho — navega a `/profile`
- [x] Si hay `avatar_url`, muestra la foto en el header mobile (40px)
- [x] Perfil NO aparece en la barra de navegación inferior mobile (máximo 5 ítems)

---

### US-007-05: Cerrar sesión desde el perfil
**Como** usuario autenticado
**Quiero** poder cerrar sesión desde la página de perfil
**Para** salir de mi cuenta de forma segura

**Criterios de aceptación:**
- [x] Sección "Zona de peligro" con borde rojo sutil
- [x] Botón "Cerrar sesión" con estilo destructivo (borde rojo, hover rojo sólido)
- [x] Redirige a `/login` al cerrar sesión

---

## 🏗️ Arquitectura Técnica

### Estructura de archivos
```
src/
  features/
    profile/
      hooks/
        useProfile.ts        # Carga perfil + monedas, updateProfile, uploadAvatar
      components/
        AvatarUpload.tsx     # Círculo 96px, upload con validación, iniciales/ícono
        ProfileForm.tsx      # Formulario completo con AvatarUpload integrado
      pages/
        ProfilePage.tsx      # Página: header externo + ProfileForm en fn-card
```

### Tipos clave
```typescript
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  currency_symbol: string
  created_at: string
}

export interface SupportedCurrency {
  code: string
  name: string
  symbol: string
}
```

### Schema de base de datos
```sql
-- Tabla profiles (ya existente en Supabase)
CREATE TABLE profiles (
  id              UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name       TEXT,
  avatar_url      TEXT,
  currency        TEXT NOT NULL DEFAULT 'MXN',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  email           TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tabla supported_currencies (ya existente, solo lectura)
-- 19 monedas con campos: code, name, symbol
-- Acceso público (sin RLS restrictivo)

-- Bucket avatars en Supabase Storage
-- Configurado como público en el Dashboard
-- Path: {user_id}/{timestamp}.{ext}
```

### Integración con otros features
- `MonthSummaryCard.tsx` (Feature 003): usa `useProfile()` para obtener `profile.currency` y pasarlo a `Intl.NumberFormat`
- `Navigation.tsx`: usa `useProfile()` para mostrar el avatar en el header mobile

---

## 🎨 UI/UX

- Layout: `px-4 pt-6 pb-28 max-w-lg mx-auto`
- Header (fuera de card): avatar 40px + título "Mi Perfil" + email
- Card del formulario: `fn-card p-6`
- Avatar upload: círculo 96px borde emerald, bg `#10B981` para iniciales
- Selector de moneda: `bg-[#1E293B] border border-[#10B981]/20` consistente con tema dark
- Zona de peligro: `border border-red-500/20 rounded-lg p-4 mt-8`
- Botón logout: `border border-red-500 text-red-400 hover:bg-red-500 hover:text-white`

---

## ⚠️ Notas de Implementación

- El upsert en `updateProfile` incluye `email: user.email` para satisfacer la restricción NOT NULL.
- La URL del avatar incluye `?t=Date.now()` para invalidar la caché del navegador tras cada subida.
- El estado local se actualiza optimistamente con `setProfile(prev => { ...prev, ...data })` sin esperar re-fetch.
- El bucket `avatars` debe configurarse como público manualmente en el Dashboard de Supabase.
