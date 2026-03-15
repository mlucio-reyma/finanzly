# Feature 008 — Escaneo de Recibo con IA

## Objetivo
Permitir al usuario fotografiar o subir un ticket/recibo y que la IA
extraiga automáticamente los datos del gasto para pre-llenar el formulario.

## Estado de implementación
**Estado:** ✅ Completado
**Fecha:** Marzo 2026

## Flujo implementado
1. En ExpenseForm, el usuario ve dos botones: "📷 Tomar foto" y "🖼️ Subir imagen"
2. La imagen se sube a Supabase Storage bucket "receipts"
3. Se envía webhook POST a n8n con la URL pública de la imagen
4. n8n procesa con Claude Vision API y extrae los datos
5. Los campos del formulario se pre-llenan automáticamente
6. Se muestra badge de confianza en 3 niveles:
   - Verde (≥0.8): "✨ Datos extraídos"
   - Amarillo (≥0.5): "⚠️ Extracción parcial"
   - Rojo (<0.5): "❌ Baja confianza — revisa todo"
7. Campos null se muestran explícitamente para llenado manual

## Arquitectura
- Frontend: ReceiptUpload.tsx + src/lib/receipt-scan.ts
- n8n workflow: Webhook → Code (construir body) → Claude Vision API → Respond
- Storage: Supabase bucket "receipts" público con RLS
- Variable de entorno: VITE_N8N_WEBHOOK_RECEIPT_SCAN

## Decisiones técnicas
- capture="environment" para abrir cámara trasera en móviles
- Nodo Code en n8n construye body con JSON.stringify para evitar
  problemas de expresiones de n8n con arrays
- URL directa a Claude API funcionó una vez resuelto el body correcto

## Archivos creados/modificados
- src/features/expenses/components/ReceiptUpload.tsx (nuevo)
- src/features/expenses/components/ExpenseForm.tsx (modificado)
- src/lib/receipt-scan.ts (nuevo)
- public/receipts bucket en Supabase Storage
