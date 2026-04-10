# Feature 010: Chat con IA Financiera

**Status:** ✅ Implementado  
**Prioridad:** Alta  
**Complejidad:** Alta  
**Estimación:** 4-6 horas  
**Dependencias:** n8n, Groq API (MVP) → Claude API (Producción), Supabase

**Estrategia de IA:**
- **MVP:** Groq API (Llama 3.1 70B) - GRATIS ✅
- **Producción:** Claude 3.5 Sonnet - $7-15/mes (cuando validemos tracción)

---

## 📋 Descripción

Sistema de chat conversacional con IA que permite a los usuarios hacer preguntas sobre sus finanzas personales y recibir análisis, insights y recomendaciones contextualizadas basadas en sus datos reales.

---

## 🎯 Objetivos

1. Proporcionar asistencia financiera personalizada mediante IA
2. Facilitar el análisis de gastos mediante lenguaje natural
3. Ofrecer insights y recomendaciones proactivas
4. Mejorar la experiencia del usuario con interacción conversacional
5. Democratizar el análisis financiero (sin necesidad de expertise)

---

## ✨ Funcionalidades

### Chat Widget Flotante
- Botón flotante en esquina inferior derecha
- Disponible en todas las páginas (excepto login/register)
- Badge de notificación (opcional, futuro)
- Animación de entrada/salida suave

### Panel de Chat
- Drawer lateral que se abre desde la derecha
- Historial de conversación (solo sesión actual)
- Input de texto con auto-focus
- Botón de envío + Enter key support
- Indicador de "typing..." mientras IA responde
- Scroll automático al último mensaje

### Contexto Financiero
La IA tiene acceso a:
- Total de gastos del mes actual
- Gastos por categoría del mes
- Top 3 gastos más grandes del mes
- Saldo disponible (si está configurado)
- Promedio de gastos diarios
- Comparación mes actual vs mes anterior

### Sugerencias Rápidas
Botones de acceso rápido a preguntas comunes:
- "¿En qué gasté más este mes?"
- "¿Cómo van mis finanzas?"
- "¿Dónde puedo ahorrar?"
- "Analiza mis gastos"
- "Compara este mes con el anterior"

### Personalización de IA
La IA se comporta como un **asesor financiero personal**:
- Tono: Amigable, profesional, empático
- Lenguaje: Español, claro, sin tecnicismos excesivos
- Respuestas: Concisas (3-5 párrafos máximo)
- Formato: Usa bullets, emojis apropiados, secciones
- Acción: Siempre sugiere siguiente paso o acción

---

## 🏗️ Arquitectura

### Estrategia de IA - Dual Path

**MVP (Fase 1) - Groq API:**
- Modelo: `llama-3.1-70b-versatile`
- Costo: $0/mes
- Rate limit: 30 req/min, 6,000 req/día
- Velocidad: Ultra rápida (~1-2s respuesta)
- Propósito: Validar feature, probar UX

**Producción (Fase 2) - Claude API:**
- Modelo: `claude-3-5-sonnet-20241022`
- Costo: ~$7-15/mes (con optimizaciones)
- Rate limit: Según tier
- Velocidad: ~2-5s respuesta
- Propósito: Máxima calidad cuando validemos tracción

**Criterios para migración MVP → Producción:**
- ✅ 50+ usuarios activos/mes
- ✅ 500+ mensajes/mes
- ✅ Feedback positivo (80%+ satisfacción)
- ✅ Feature considerado "core" por usuarios

---

### Frontend (React)

```typescript
// src/lib/ai-chat.ts
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  userId: string
  currentMonth: {
    total: number
    byCategory: { category: string; amount: number }[]
    topExpenses: { description: string; amount: number }[]
  }
  comparison?: {
    currentMonth: number
    previousMonth: number
    change: number
    changePercent: number
  }
}

// Tipo de proveedor de IA (para migración fácil)
type AIProvider = 'groq' | 'claude'

export async function sendChatMessage(
  message: string,
  context: ChatContext,
  provider: AIProvider = 'groq' // Default a Groq para MVP
): Promise<string> {
  const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message, 
      context,
      provider // n8n decidirá qué API usar
    })
  })
  
  if (!response.ok) throw new Error('Chat request failed')
  
  const data = await response.json()
  return data.response
}
```

### n8n Workflow

**Nombre:** `finanzly-chat-ai`

**Estrategia:** Workflow único que soporta ambos proveedores con switch node

---

#### **Nodos del Workflow:**

**1. Webhook** - Trigger
- Method: POST
- Path: `/finanzly/chat`
- Response: Return from node

---

**2. Function** - Prepare Context & System Prompt
```javascript
const { message, context, provider = 'groq' } = $input.item.json

// Construir contexto financiero
const financialContext = `
DATOS FINANCIEROS DEL USUARIO:
- Total gastado este mes: $${context.currentMonth.total.toLocaleString()}
- Gastos por categoría:
${context.currentMonth.byCategory.map(c => 
  `  • ${c.category}: $${c.amount.toLocaleString()}`
).join('\n')}
- Top 3 gastos más grandes:
${context.currentMonth.topExpenses.map((e, i) => 
  `  ${i+1}. ${e.description}: $${e.amount.toLocaleString()}`
).join('\n')}
${context.comparison ? `
- Comparación con mes anterior:
  • Mes actual: $${context.comparison.currentMonth.toLocaleString()}
  • Mes anterior: $${context.comparison.previousMonth.toLocaleString()}
  • Cambio: ${context.comparison.changePercent}%
` : ''}
`

const systemPrompt = `Eres un asesor financiero personal experto y empático.

${financialContext}

INSTRUCCIONES IMPORTANTES:
- Responde SIEMPRE en español de México
- Máximo 4 párrafos (sé conciso y directo)
- Usa emojis relevantes para hacer la respuesta más amigable
- Incluye bullets (•) para listas
- Sé empático y motivador (no juzgues gastos)
- Da recomendaciones ACCIONABLES (pasos concretos)
- Si el usuario no tiene datos, motívalo a comenzar a registrar
- Evita tecnicismos complejos
- Termina sugiriendo una acción o pregunta de seguimiento

TONO: Amigable, profesional, como un amigo experto en finanzas`

return {
  json: {
    userMessage: message,
    systemPrompt: systemPrompt,
    provider: provider,
    timestamp: new Date().toISOString()
  }
}
```

---

**3. Switch** - Seleccionar Proveedor de IA
- **Mode:** Expression
- **Expression:** `{{ $json.provider }}`
- **Routing Rules:**
  - `groq` → Route 0 (Groq API)
  - `claude` → Route 1 (Claude API)
  - Default → Route 0 (Groq)

---

**4a. HTTP Request** - Groq API (Route 0)
- **Method:** POST
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Authentication:** None
- **Headers:**
  ```json
  {
    "Authorization": "Bearer {{ $env.GROQ_API_KEY }}",
    "Content-Type": "application/json"
  }
  ```
- **Body:**
  ```json
  {
    "model": "llama-3.1-70b-versatile",
    "messages": [
      {
        "role": "system",
        "content": "={{ $json.systemPrompt }}"
      },
      {
        "role": "user",
        "content": "={{ $json.userMessage }}"
      }
    ],
    "max_tokens": 600,
    "temperature": 0.7,
    "top_p": 0.9
  }
  ```

---

**4b. HTTP Request** - Claude API (Route 1)
- **Method:** POST
- **URL:** `https://api.anthropic.com/v1/messages`
- **Authentication:** None
- **Headers:**
  ```json
  {
    "x-api-key": "{{ $env.ANTHROPIC_API_KEY }}",
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json"
  }
  ```
- **Body:**
  ```json
  {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 800,
    "messages": [
      {
        "role": "user",
        "content": "={{ $json.systemPrompt }}\n\nPREGUNTA DEL USUARIO: {{ $json.userMessage }}"
      }
    ],
    "temperature": 0.7
  }
  ```

---

**5. Function** - Parse Response (unified)
```javascript
// Este nodo recibe tanto de Groq como de Claude
const input = $input.item.json

// Detectar qué proveedor respondió por la estructura
let response, provider, model

if (input.choices) {
  // Groq (formato OpenAI)
  response = input.choices[0].message.content
  provider = 'groq'
  model = input.model
} else if (input.content) {
  // Claude (formato Anthropic)
  response = input.content[0].text
  provider = 'claude'
  model = input.model
} else {
  throw new Error('Formato de respuesta desconocido')
}

return {
  json: {
    response: response,
    provider: provider,
    model: model,
    timestamp: new Date().toISOString()
  }
}
```

---

**6. Respond to Webhook**
- **Response Code:** 200
- **Response Body:** `{{ $json }}`

---

### Diagrama del Workflow

```
┌─────────────┐
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Prepare Context │
│  & Prompt       │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│   Switch    │
│  (provider) │
└──┬────────┬─┘
   │        │
groq│        │claude
   │        │
   ▼        ▼
┌────────┐ ┌────────┐
│ Groq   │ │ Claude │
│ API    │ │ API    │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
         ▼
   ┌──────────┐
   │  Parse   │
   │ Response │
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │ Respond  │
   │ Webhook  │
   └──────────┘
```

---

### Configuración de Variables de Entorno en n8n

```bash
# MVP - Solo Groq (obligatorio)
GROQ_API_KEY=gsk_tu_key_aqui

# Producción - Claude (opcional por ahora)
ANTHROPIC_API_KEY=sk-ant-tu_key_aqui
```

---

## 🎨 Diseño UI

### ChatWidget.tsx
```typescript
interface ChatWidgetProps {
  isOpen: boolean
  onToggle: () => void
}

// Botón flotante
- Posición: fixed bottom-6 right-6
- Size: 60px × 60px (circular)
- Color: bg-emerald-500 hover:bg-emerald-600
- Icono: MessageCircle (lucide-react)
- Shadow: shadow-lg
- Badge: Opcional (futuro)
- z-index: 50
```

### ChatDrawer.tsx
```typescript
interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// Estructura
<Drawer>
  <Header>
    <Title>💬 Chat Financiero</Title>
    <CloseButton />
  </Header>
  
  <QuickActions>
    {suggestions.map(s => <Chip>{s}</Chip>)}
  </QuickActions>
  
  <MessageList>
    {messages.map(msg => (
      <Message 
        role={msg.role}
        content={msg.content}
        timestamp={msg.timestamp}
      />
    ))}
    {isLoading && <TypingIndicator />}
  </MessageList>
  
  <InputArea>
    <Input placeholder="Pregunta sobre tus finanzas..." />
    <SendButton />
  </InputArea>
</Drawer>
```

### Estilos
- Drawer width: `400px` (desktop), `100vw` (mobile)
- Message bubbles:
  - User: bg-emerald-100 text-right
  - Assistant: bg-gray-100 text-left
- Font: Inter (consistente con app)
- Spacing: Generous padding para legibilidad
- Scroll: Smooth, auto-scroll to bottom

---

## 📊 Datos y Contexto

### Query Supabase (Frontend)
```sql
-- Total del mes actual
SELECT 
  SUM(amount) as total,
  COUNT(*) as count
FROM expenses
WHERE user_id = $1 
  AND date >= date_trunc('month', CURRENT_DATE)
  AND date < date_trunc('month', CURRENT_DATE) + interval '1 month';

-- Por categoría
SELECT 
  category,
  SUM(amount) as amount,
  COUNT(*) as count
FROM expenses
WHERE user_id = $1 
  AND date >= date_trunc('month', CURRENT_DATE)
  AND date < date_trunc('month', CURRENT_DATE) + interval '1 month'
GROUP BY category
ORDER BY amount DESC;

-- Top 3 gastos
SELECT 
  description,
  amount,
  establishment,
  category,
  date
FROM expenses
WHERE user_id = $1 
  AND date >= date_trunc('month', CURRENT_DATE)
  AND date < date_trunc('month', CURRENT_DATE) + interval '1 month'
ORDER BY amount DESC
LIMIT 3;

-- Comparación mensual
WITH current_month AS (
  SELECT SUM(amount) as total
  FROM expenses
  WHERE user_id = $1
    AND date >= date_trunc('month', CURRENT_DATE)
    AND date < date_trunc('month', CURRENT_DATE) + interval '1 month'
),
previous_month AS (
  SELECT SUM(amount) as total
  FROM expenses
  WHERE user_id = $1
    AND date >= date_trunc('month', CURRENT_DATE) - interval '1 month'
    AND date < date_trunc('month', CURRENT_DATE)
)
SELECT 
  c.total as current,
  p.total as previous,
  (c.total - p.total) as change,
  ROUND(((c.total - p.total) / NULLIF(p.total, 0) * 100)::numeric, 2) as change_percent
FROM current_month c, previous_month p;
```

---

## 🔐 Seguridad

### Validaciones
- Solo usuarios autenticados pueden usar el chat
- Contexto limitado a datos del usuario actual
- Rate limiting: Máximo 10 mensajes por minuto (implementar en n8n)
- No almacenar historial de conversaciones (privacy)
- Sanitizar inputs antes de enviar a IA

### Variables de Entorno

**Frontend (.env.local):**
```env
# Webhook de n8n
VITE_N8N_WEBHOOK_CHAT=https://n8n.tudominio.com/webhook/finanzly/chat
```

**n8n (Environment Variables):**
```env
# MVP - Groq API (OBLIGATORIO)
GROQ_API_KEY=gsk_tu_key_aqui

# Producción - Claude API (OPCIONAL - para cuando migremos)
ANTHROPIC_API_KEY=sk-ant-tu_key_aqui
```

**Cómo obtener las API Keys:**

**Groq (GRATIS):**
1. Ir a https://console.groq.com
2. Sign up con email
3. Ir a "API Keys"
4. Click "Create API Key"
5. Copiar key (empieza con `gsk_`)

**Claude (para después):**
1. Ir a https://console.anthropic.com
2. Sign up
3. Settings → API Keys
4. Create Key
5. Copiar key (empieza con `sk-ant-`)

---

## 🧪 Testing

### Casos de Prueba

**1. Chat básico**
- Usuario escribe "¿En qué gasté más?"
- IA responde con categoría más alta y detalles
- Mensaje se muestra correctamente en UI

**2. Sugerencias rápidas**
- Click en "¿Cómo van mis finanzas?"
- Se envía mensaje automáticamente
- IA responde con análisis completo

**3. Contexto vacío**
- Usuario sin gastos del mes
- IA responde de manera apropiada ("Aún no tienes gastos registrados...")

**4. Mensajes largos**
- Enviar mensaje de 500 caracteres
- Debe procesarse correctamente
- Scroll automático funciona

**5. Errores de red**
- Simular fallo de n8n
- Mostrar error amigable
- Permitir reintentar

**6. Loading states**
- Enviar mensaje
- Mostrar "typing..." indicator
- Deshabilitar input durante procesamiento

---

## 📱 Responsive

### Desktop (≥1024px)
- Drawer width: 400px
- Slide from right
- Overlay oscuro en background

### Tablet (768px-1023px)
- Drawer width: 350px
- Similar a desktop

### Mobile (<768px)
- Drawer width: 100vw (full screen)
- Slide from bottom
- Header con título centrado

---

## ⚡ Performance

### Optimizaciones
- Lazy load del ChatDrawer (solo cuando se abre)
- Debounce en input (300ms)
- Memoizar mensajes con useMemo
- Virtual scrolling si historial > 50 mensajes (futuro)
- Comprimir contexto antes de enviar

### Tiempos Esperados
- Apertura de drawer: < 200ms
- Respuesta de IA: 2-5 segundos
- Scroll automático: < 100ms

---

## 🚀 Implementación

### Fase 1: n8n Workflow
1. Crear workflow `finanzly-chat-ai`
2. Configurar webhook
3. Probar con Postman
4. Validar respuestas de Claude

### Fase 2: Frontend - Estructura
1. Crear `src/features/chat/`
2. Implementar `ChatWidget.tsx`
3. Implementar `ChatDrawer.tsx`
4. Crear `src/lib/ai-chat.ts`

### Fase 3: Integración
1. Agregar widget a `MainLayout.tsx`
2. Implementar queries de contexto
3. Conectar con n8n webhook
4. Testing end-to-end

### Fase 4: Polish
1. Animaciones
2. Error handling
3. Loading states
4. Responsive adjustments

---

## 📦 Archivos a Crear

```
src/
├── features/
│   └── chat/
│       ├── components/
│       │   ├── ChatWidget.tsx         # Botón flotante
│       │   ├── ChatDrawer.tsx         # Panel de chat
│       │   ├── Message.tsx            # Componente de mensaje individual
│       │   ├── TypingIndicator.tsx   # "..." animado
│       │   └── QuickActions.tsx       # Botones de sugerencias
│       ├── hooks/
│       │   ├── useChat.ts             # Lógica del chat
│       │   └── useChatContext.ts      # Obtener contexto financiero
│       └── types.ts                    # Interfaces
├── lib/
│   └── ai-chat.ts                      # Cliente API
```

---

## 🔄 Flujo de Usuario

```
1. Usuario abre la app → Ve botón de chat flotante
2. Click en botón → Se abre drawer lateral
3. Ve sugerencias rápidas → Click en una O escribe pregunta
4. Mensaje se envía → "Typing..." aparece
5. IA procesa (2-5s) → Respuesta aparece
6. Usuario lee respuesta → Puede hacer follow-up
7. Cierra drawer → Chat se limpia (no persiste)
```

---

## 🎨 Ejemplos de Interacciones

### Ejemplo 1: Análisis General
**Usuario:** "¿Cómo van mis finanzas este mes?"

**IA:** 
```
📊 Análisis de Marzo 2026

¡Hola! Aquí está tu resumen financiero:

💰 **Total Gastado:** $12,450.00
Este mes has gastado aproximadamente $415 por día.

📈 **Categorías Principales:**
• 🏠 Hogar: $4,200 (34%)
• 🍔 Alimentación: $3,800 (31%)
• 🚗 Transporte: $2,100 (17%)

🔍 **Top 3 Gastos:**
1. Renta - $3,500
2. Súper Walmart - $1,200
3. Gasolina Total - $800

💡 **Recomendación:**
Estás gastando 31% en alimentación. Considera preparar más comidas en casa 
para reducir este rubro. Un ahorro del 15% te daría $570 extra este mes.

¿Quieres que analice alguna categoría específica? 🎯
```

### Ejemplo 2: Comparación
**Usuario:** "Compara este mes con el anterior"

**IA:**
```
📊 Comparación Febrero vs Marzo

📉 **Buenas noticias!** Has reducido tus gastos.

**Marzo:** $12,450
**Febrero:** $14,800
**Diferencia:** -$2,350 (-15.9%) 🎉

🌟 **Mejoras notables:**
• Transporte: -$450 (Buen trabajo!)
• Entretenimiento: -$320
• Hogar: Similar (+$50)

⚠️ **Áreas que aumentaron:**
• Alimentación: +$180 (leve aumento)

🎯 **Siguiente paso:**
Mantén este ritmo! Si sigues así, podrías ahorrar $28,200 al año.
¿Quieres establecer una meta de ahorro? 💪
```

### Ejemplo 3: Sin Datos
**Usuario:** "¿En qué gasté más?"

**IA (usuario nuevo):**
```
👋 ¡Hola!

Aún no tienes gastos registrados este mes. 

📝 **Para comenzar:**
1. Click en "+" para agregar tu primer gasto
2. Usa la cámara 📸 para escanear recibos automáticamente
3. O ingresa manualmente los detalles

💡 **Tip:** Entre más gastos registres, mejores insights 
podré darte sobre tus finanzas!

¿Te ayudo a registrar tu primer gasto? 🚀
```

---

## 🔮 Futuras Mejoras (v2)

- [ ] Persistir historial de chat en Supabase
- [ ] Modo de voz (speech-to-text)
- [ ] Sugerencias proactivas ("Notaste que gastaste más en X?")
- [ ] Exportar conversación a PDF
- [ ] Múltiples idiomas (Inglés, Portugués)
- [ ] Gráficas inline en respuestas
- [ ] Integración con calendar (eventos financieros)
- [ ] Modo "coach" con metas y seguimiento

---

## ✅ Criterios de Aceptación

- [ ] Widget flotante visible en todas las páginas (excepto auth)
- [ ] Drawer se abre/cierra suavemente
- [ ] Sugerencias rápidas funcionan
- [ ] Input acepta texto y Enter key
- [ ] IA responde en < 10 segundos
- [ ] Respuestas son contextualizadas con datos reales
- [ ] Loading state durante procesamiento
- [ ] Error handling para fallos de red
- [ ] Responsive en mobile/tablet/desktop
- [ ] No crashea con contexto vacío
- [ ] Scroll automático a último mensaje

---

## 💰 Costos y Escalamiento

### MVP - Groq (Fase Actual)
**Costos:**
- API: **$0/mes** ✅
- n8n: $0 (self-hosted) o $20/mes (cloud)
- **Total: $0-20/mes**

**Límites:**
- 30 requests/min
- 6,000 requests/día
- Suficiente para ~200 usuarios activos

**Cuando migrar a Producción:**
- ✅ 50+ usuarios activos/mes
- ✅ 500+ mensajes de chat/mes
- ✅ 80%+ satisfacción de usuarios
- ✅ Presupuesto disponible ($10-15/mes)

---

### Producción - Claude (Fase 2)
**Costos estimados:**
- 100 usuarios × 50 msgs/mes = 5,000 mensajes
- ~800 tokens/mensaje = 4M tokens
- Input: 4M × $3/1M = **$12**
- Output: 4M × $15/1M = **$60**
- **Total: ~$72/mes** 💰

**Optimizaciones para reducir costo:**
1. **Limitar tokens de salida:** 400 tokens (vs 800) = -50% costo
2. **Cache de respuestas comunes:** -30% requests
3. **Rate limiting por usuario:** 30 msgs/mes = -40% uso
4. **Usar Haiku para queries simples:** -80% costo en esos casos

**Costo optimizado:** ~$15-20/mes

---

### Estrategia Híbrida (Futuro)
```
Pregunta simple → Groq (gratis)
  ej: "¿Cuánto gasté hoy?"
  
Análisis complejo → Claude (pagado)
  ej: "Analiza mi patrón de gastos y sugiere ahorros"
```

Esto mantendría costo en **~$5-10/mes**

---

## 📊 Métricas de Éxito

- **Uso:** 60%+ de usuarios activos usan chat al menos 1 vez/semana
- **Engagement:** Promedio 3+ mensajes por sesión
- **Satisfacción:** 80%+ encuentran respuestas útiles
- **Performance:** 95%+ de respuestas en < 10s
- **Costo:** Mantener bajo $20/mes hasta tener revenue

---

## 🏁 Definición de Completado

✅ El feature está completo cuando:
1. n8n workflow deployado y funcionando
2. Frontend implementado y responsive
3. Tests manuales pasados
4. Deployed a producción
5. Documentación actualizada (README, PROTECTED.md)
6. No hay bugs críticos reportados

---

**Creado:** 2026-04-06  
**Autor:** Lucio (con asistencia de Claude)  
**Versión:** 1.0

---

## ✅ IMPLEMENTACIÓN COMPLETADA

### Día 1: Backend
- ✅ Workflow n8n configurado (5 nodos)
- ✅ Groq API integrada (Llama 3.3 70B Versatile)
- ✅ Webhook funcionando: https://n8n.codebylucio.dev/webhook/finanzly/chat
- ✅ System prompt optimizado con saludo condicional
- ✅ Parámetros: max_tokens: 600, temperature: 0.7, top_p: 0.9

### Día 2: Frontend
- ✅ Cliente de API (`src/lib/ai-chat.ts`)
- ✅ Tipos TypeScript (`src/features/chat/types.ts`)
- ✅ Hooks implementados:
  - `useChatContext.ts` - Obtiene contexto financiero de Supabase con RLS
  - `useChat.ts` - Maneja estado y lógica del chat
- ✅ Componentes UI:
  - `Message.tsx` - Mensaje individual (user/assistant)
  - `TypingIndicator.tsx` - Animación de escritura (...)
  - `QuickActions.tsx` - Sugerencias rápidas
  - `ChatDrawer.tsx` - Panel lateral del chat
  - `ChatWidget.tsx` - (Deprecado - ahora ícono en header)
- ✅ Integrado en Navigation (ícono MessageCircle en header móvil y desktop)
- ✅ Responsive design completo
- ✅ Saludo condicional (solo en primer mensaje de la conversación)
- ✅ Clear history funcional

### Funcionalidades
- ✅ Análisis de gastos del mes actual
- ✅ Desglose por categoría
- ✅ Top 3 gastos más grandes
- ✅ Comparación mensual (opcional)
- ✅ Recomendaciones accionables
- ✅ Conversaciones naturales en español de México
- ✅ Respuestas con emojis relevantes
- ✅ Enter para enviar, Shift+Enter para nueva línea
- ✅ Auto-scroll al último mensaje
- ✅ Historial persistente durante la sesión

### Costo
- MVP: $0/mes (Groq API gratuita)
- Límites: 30 req/min, 6000 req/día
