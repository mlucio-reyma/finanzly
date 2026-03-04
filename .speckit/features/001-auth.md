# Feature 001 — Autenticación & Seguridad
**Proyecto:** Finanzly
**Estado:** 📋 Especificado | ⬜ En desarrollo | ✅ Implementado
**Esfuerzo estimado:** ~7 horas
**Prioridad:** P0 — Bloqueante para todo lo demás

---

## 📋 Descripción

Sistema de autenticación completo usando Supabase Auth. Cubre registro, login, recuperación de contraseña y protección de rutas. Es la base de seguridad sobre la que se construye toda la app.

---

## 👤 Historias de Usuario

### US-001-01: Registro de cuenta
**Como** usuario nuevo de Finanzly
**Quiero** registrarme con mi email y contraseña
**Para** crear mi cuenta y empezar a registrar mis gastos

**Criterios de aceptación:**
- [ ] Formulario con campos: email, contraseña, confirmar contraseña
- [ ] Validación de email con formato correcto
- [ ] Contraseña mínimo 8 caracteres
- [ ] Contraseña y confirmación deben coincidir
- [ ] Error claro si el email ya está registrado
- [ ] Email de confirmación enviado al registrarse
- [ ] Redirección al dashboard tras registro exitoso

---

### US-001-02: Inicio de sesión
**Como** usuario registrado
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder a mis datos financieros

**Criterios de aceptación:**
- [ ] Formulario con email y contraseña
- [ ] Mensaje de error genérico si credenciales incorrectas (no revelar si email existe)
- [ ] Sesión persistente — no cerrar al refrescar página
- [ ] Redirección automática al dashboard si ya hay sesión activa al entrar a `/login`
- [ ] Loading state durante el proceso de login

---

### US-001-03: Recuperación de contraseña
**Como** usuario que olvidó su contraseña
**Quiero** recibir un link de recuperación en mi email
**Para** poder acceder nuevamente a mi cuenta

**Criterios de aceptación:**
- [ ] Formulario solo con campo email
- [ ] Confirmación de envío sin revelar si el email existe en el sistema
- [ ] Link de recuperación funcional que lleva a pantalla de nueva contraseña
- [ ] Nueva contraseña con mismas validaciones que el registro

---

### US-001-04: Cierre de sesión
**Como** usuario autenticado
**Quiero** poder cerrar sesión
**Para** proteger mi información en dispositivos compartidos

**Criterios de aceptación:**
- [ ] Botón de logout accesible desde el menú principal
- [ ] Redirección a `/login` tras logout
- [ ] Limpieza completa del estado local al hacer logout

---

## 🏗️ Arquitectura Técnica

### Rutas
```
/login          → Página de login
/register       → Página de registro
/forgot-password → Solicitud de recuperación
/reset-password  → Nueva contraseña (desde link de email)
/dashboard      → Ruta protegida (requiere auth)
/* privadas     → Redirigen a /login si no hay sesión
```

### Estructura de archivos
```
src/
  features/
    auth/
      components/
        LoginForm.tsx
        RegisterForm.tsx
        ForgotPasswordForm.tsx
        ResetPasswordForm.tsx
      hooks/
        useAuth.ts          # Hook principal de autenticación
      pages/
        LoginPage.tsx
        RegisterPage.tsx
        ForgotPasswordPage.tsx
        ResetPasswordPage.tsx
  components/
    ProtectedRoute.tsx      # Wrapper para rutas privadas
  lib/
    supabase.ts             # Cliente de Supabase
```

### Supabase Config
- Proveedor: **Email + Password** (nativo de Supabase Auth)
- Email confirmación: **habilitado**
- RLS: No aplica a Auth (manejado por Supabase internamente)
- Tabla `profiles` creada automáticamente vía trigger en `auth.users`

### Schema de base de datos
```sql
-- Tabla de perfiles (extensión de auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para crear profile automáticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 🎨 UI/UX

- Pantallas centradas, card con ancho máximo 400px
- Logo de Finanzly en la parte superior
- Soporte dark/light mode desde el primer render
- Todos los mensajes de error en español
- Link entre Login ↔ Register visible en ambas pantallas

---

## ⚠️ Riesgos & Consideraciones

- El email de confirmación de Supabase viene en inglés por defecto — configurar plantilla en español en el dashboard de Supabase.
- En desarrollo local usar `localhost` en la lista de URLs permitidas de Supabase.
- Agregar `finanzly.codebylucio.dev` a las URLs de redirect en Supabase antes del deploy.
