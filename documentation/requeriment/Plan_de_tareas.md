# PLAN DE TAREAS - EMAIL-TO-KANBAN MVP

## RESUMEN EJECUTIVO

**Proyecto:** Email-to-Kanban MVP
**Stack:** Next.js 16, React, TypeScript, Prisma, PostgreSQL (NeonDB), Vercel AI SDK, Gemini, Gmail API
**Duración estimada:** 10 semanas (6 sprints)
**Objetivo:** Validar el concepto de clasificación automática de emails con IA mediante un Kanban simplificado

---

## SPRINT 1: FUNDACIÓN Y SETUP (1.5 semanas)

### 1.1 Configuración del Proyecto Base
- [X] Inicializar proyecto Next.js 16 con TypeScript
- [X] Configurar TailwindCSS
- [X] Instalar y configurar ShadCN/UI
- [X] Configurar ESLint y Prettier
- [X] Crear estructura de carpetas según documentación
- [X] Configurar variables de entorno (.env.example)
- [X] Setup de Git y .gitignore

### 1.2 Configuración de Base de Datos
- [X] Crear cuenta en NeonDB
- [X] Configurar PostgreSQL en NeonDB
- [X] Instalar Prisma
- [X] Crear schema.prisma con todos los modelos:
  - [X] Model User
  - [X] Model Email
  - [X] Model Task
  - [X] Model Comment
  - [X] Model ImportLog
- [X] Ejecutar primera migración de Prisma
- [X] Crear cliente Prisma singleton (lib/prisma.ts)
- [X] Crear seed script para datos de prueba

### 1.3 Autenticación con Google OAuth (RF-MVP-001)
- [X] Crear proyecto en Google Cloud Console
- [X] Configurar OAuth 2.0 credentials
- [X] Configurar scopes: email, profile, gmail.readonly
- [X] Instalar next-auth v5
- [X] Crear archivo de configuración NextAuth
- [X] Implementar API route: /api/auth/[...nextauth]/route.ts
- [X] Implementar API route: /api/auth/callback/route.ts (manejado por NextAuth automáticamente)
- [X] Crear middleware de autenticación
- [X] Implementar lógica de validación de usuario en BD
- [X] Crear sistema de JWT con expiración de 7 días

### 1.4 Vista de Login
- [X] Crear página /app/(auth)/login/page.tsx
- [X] Diseñar UI de Login con logo y botón de Google
- [X] Implementar componente LoginButton
- [X] Implementar redirección según usuario (nuevo → integración, existente → dashboard)
- [X] Crear layout para rutas de autenticación
- [X] Validar flujo completo de OAuth

---

## SPRINT 2: CONFIGURACIÓN E INFRAESTRUCTURA (1.5 semanas)

### 2.1 Vista de Perfil de Usuario (RF-MVP-011)

- [ ] Crear página /app/(dashboard)/perfil/page.tsx
- [X] Crear layout de dashboard con header
- [X] Implementar Card de Información Personal (readonly)
- [ ] Implementar Card de Configuración de Gmail

### 2.4 Funcionalidad de Cerrar Sesión (RF-MVP-012)

- [ ] Crear componente Header con dropdown de usuario
- [ ] Implementar modal de confirmación de cierre de sesión
- [ ] Crear API route: /api/auth/logout/route.ts
- [ ] Implementar invalidación de token JWT
- [ ] Revocar OAuth token de Google
- [ ] Limpiar estado de Zustand y localStorage
- [ ] Implementar redirección a /login
- [ ] Manejar sesión expirada automáticamente

---

## SPRINT 3: IA Y PROCESAMIENTO DE EMAILS (2 semanas)

### 3.1 Integración con Gmail API
- [ ] Instalar googleapis
- [X] Crear lib/gmail-api.ts con funciones:
  - [X] fetchGmailMessages(options) (implementación básica)
  - [ ] extractEmailMetadata(message)
- [ ] Implementar consulta de últimos 20 emails
- [ ] Implementar filtrado por fecha (lastImportAt)
- [ ] Extraer: gmailId, senderId, senderName, subject, body, receivedAt
- [ ] Manejar errores de Gmail API (401, 403, 429)
- [ ] Implementar timeout de 10 segundos

### 3.2 Integración con Gemini AI (RF-MVP-008)
- [ ] Crear cuenta en Google AI Studio
- [ ] Obtener Gemini API Key
- [ ] Instalar Vercel AI SDK
- [ ] Crear lib/gemini.ts con funciones:
  - [ ] classifyEmail(emailData)
  - [ ] parseGeminiResponse(response)
- [ ] Implementar prompt de clasificación completo (según documentación)
- [ ] Manejar respuesta JSON de Gemini
- [ ] Implementar fallback si Gemini falla
- [ ] Detectar categoría: Cliente, Lead, Interno, Spam
- [ ] Detectar prioridad: Urgente, Alta, Media, Baja
- [ ] Detectar tareas múltiples en un solo email
- [ ] Extraer dueDate si está disponible

### 3.3 Proceso de Importación (RF-MVP-007)
- [ ] Crear API route: /api/emails/import/route.ts
- [ ] Implementar validación de usuario autenticado
- [ ] Verificar que gmailApiKey esté configurada
- [ ] Validar que no haya importación en progreso
- [ ] Crear registro en ImportLog (status: processing)
- [ ] Obtener emails de Gmail API (max 20)
- [ ] Implementar procesamiento en paralelo (batches de 5)
- [ ] Por cada email:
  - [ ] Clasificar con Gemini
  - [ ] Descartar si es Spam
  - [ ] Guardar en tabla emails
  - [ ] Crear tareas si hasTask = true
  - [ ] Actualizar progreso en ImportLog
- [ ] Finalizar ImportLog (status: completed)
- [ ] Actualizar user.lastImportAt
- [ ] Retornar resumen de importación

### 3.4 Testing y Refinamiento de IA
- [ ] Crear dataset de 100 emails reales en español
- [ ] Probar clasificación de emails de clientes
- [ ] Probar clasificación de leads
- [ ] Probar emails internos
- [ ] Probar detección de spam
- [ ] Probar emails con múltiples tareas
- [ ] Probar emails en inglés y portugués
- [ ] Validar precisión ≥75%
- [ ] Refinar prompts según resultados
- [ ] Manejar emails muy largos (>5000 caracteres)

---

## SPRINT 4: UI PRINCIPAL - KANBAN (2 semanas)

### 4.1 Layout Principal (RF-MVP-003)
- [ ] Crear página /app/(dashboard)/page.tsx
- [ ] Implementar layout de dashboard
- [ ] Crear componente Header con:
  - [ ] Logo
  - [ ] Campo de búsqueda global
  - [ ] Dropdowns de filtros
  - [ ] Avatar y dropdown de usuario
- [ ] Implementar grid layout: Bandeja lateral + Kanban central
- [ ] Crear placeholders para estado vacío

### 4.2 Configuración de Zustand Store
- [X] Instalar zustand
- [ ] Crear store/useStore.ts según documentación
- [ ] Definir interfaces: Email, Task, Filters, Store
- [ ] Implementar state:
  - [ ] user, emails, tasks, filters, selectedTaskId, isImporting
- [ ] Implementar actions:
  - [ ] setUser, setEmails, setTasks
  - [ ] updateTask, setFilters, setSelectedTaskId
  - [ ] setIsImporting, reset
- [ ] Configurar persistencia con zustand/persist

### 4.3 Bandeja Lateral de Emails
- [ ] Crear componente components/kanban/EmailBandeja.tsx
- [ ] Diseñar lista de emails con:
  - [ ] Avatar del remitente
  - [ ] Nombre del remitente
  - [ ] Asunto truncado
  - [ ] Badge de cantidad de tareas
  - [ ] Badge de categoría
  - [ ] Timestamp relativo
- [ ] Implementar botón "Importar Gmails"
- [ ] Agregar ícono de colapsar/expandir
- [ ] Implementar funcionalidad de colapsar con animación
- [ ] Mostrar solo emails con hasTask = true
- [ ] Instalar react-window para virtualización
- [ ] Implementar virtualización si >50 emails

### 4.4 Componentes de Kanban
- [ ] Crear componente components/kanban/KanbanBoard.tsx
- [ ] Crear componente components/kanban/KanbanColumn.tsx
- [ ] Crear 3 columnas:
  - [ ] Tareas (Pendiente)
  - [ ] En Proceso (En Progreso)
  - [ ] Terminado (Completado)
- [ ] Implementar contadores de cards por columna
- [ ] Agregar placeholders para columnas vacías
- [ ] Implementar lazy loading si >50 cards

### 4.5 Cards de Tareas (RF-MVP-004)
- [ ] Crear componente components/kanban/TaskCard.tsx
- [ ] Diseñar estructura de card según documentación:
  - [ ] Badge de prioridad (esquina superior derecha)
  - [ ] Asunto del email (truncado a 2 líneas)
  - [ ] Avatar y nombre del remitente
  - [ ] Badge de categoría
  - [ ] Footer con ícono de tareas múltiples
  - [ ] Timestamp relativo
- [ ] Implementar estados hover
- [ ] Implementar click para abrir panel lateral
- [ ] Agregar badge "🔗 Relacionadas" para emails con múltiples tareas
- [ ] Usar componentes Card de ShadCN/UI

### 4.6 Drag & Drop (RF-MVP-006)
- [ ] Instalar @dnd-kit/core y @dnd-kit/sortable
- [ ] Implementar DndContext en KanbanBoard
- [ ] Hacer cards draggables
- [ ] Implementar feedback visual durante drag:
  - [ ] Opacity 0.5 en card
  - [ ] Borde punteado en columnas válidas
  - [ ] Cursor grabbing
- [ ] Implementar drop handler
- [ ] Actualizar estado en Zustand
- [ ] Crear API route: /api/tasks/[id]/route.ts (PATCH)
- [ ] Actualizar status en BD
- [ ] Mostrar toast al mover card
- [ ] Implementar animación de rebote si drop inválido
- [ ] Agregar debounce de 300ms para BD

### 4.7 Modal de Importación
- [ ] Crear componente components/modals/ImportModal.tsx
- [ ] Implementar modal de confirmación
- [ ] Crear barra de progreso animada
- [ ] Implementar polling o WebSocket para progreso en tiempo real
- [ ] Mostrar resumen al finalizar importación
- [ ] Manejar errores de importación
- [ ] Implementar botón deshabilitado si no hay API Key
- [ ] Agregar tooltip informativo

---

## SPRINT 5: DETALLE Y COMENTARIOS (1.5 semanas)

### 5.1 Panel Lateral Derecho (RF-MVP-005)
- [ ] Crear componente components/panel/DetailPanel.tsx
- [ ] Implementar slide-over desde la derecha (400px)
- [ ] Crear animación slide-in/out (300ms)
- [ ] Implementar cierre con botón X
- [ ] Implementar cierre con tecla ESC
- [ ] Diseñar estructura con secciones:
  - [ ] Header con botón cerrar
  - [ ] Sección 1: Información del Email
  - [ ] Sección 2: Metadata de IA
  - [ ] Sección 3: Comentarios
  - [ ] Sección 4: Acciones

### 5.2 Información del Email
- [ ] Mostrar avatar y nombre del remitente
- [ ] Mostrar asunto completo (no truncado)
- [ ] Mostrar fecha de recepción formateada
- [ ] Instalar dompurify para sanitización de HTML
- [ ] Implementar sanitización del body HTML
- [ ] Mostrar cuerpo del email con max-height y scroll
- [ ] Mostrar badges de categoría y prioridad

### 5.3 Sistema de Comentarios
- [ ] Crear API route: /api/comments/route.ts (GET, POST)
- [ ] Implementar lista de comentarios
- [ ] Crear campo de texto expandible
- [ ] Implementar "Agregar comentario"
- [ ] Guardar en tabla task_comments
- [ ] Mostrar comentarios con:
  - [ ] Avatar del usuario
  - [ ] Texto del comentario
  - [ ] Timestamp relativo
  - [ ] Botón de editar (solo en hover)
- [ ] Implementar funcionalidad de editar comentario
- [ ] Actualizar updatedAt al editar
- [ ] Mostrar indicador "editado"

### 5.4 Cambio de Estado desde Panel
- [ ] Crear dropdown de cambio de estado
- [ ] Implementar opciones: Tareas, En Proceso, Terminado
- [ ] Agregar botón "Guardar cambios"
- [ ] Actualizar status en BD
- [ ] Mover card en Kanban automáticamente
- [ ] Mostrar toast de confirmación
- [ ] Mantener panel abierto después del cambio

### 5.5 Emails con Múltiples Tareas
- [ ] Detectar si email tiene múltiples tareas
- [ ] Agregar sección "Tareas asociadas"
- [ ] Mostrar mini-cards clickeables
- [ ] Implementar navegación entre tareas del mismo email
- [ ] Actualizar panel al cambiar de tarea

### 5.6 Responsive Design
- [ ] Adaptar layout para tablet (768px-1279px)
- [ ] Adaptar layout para mobile (375px-767px)
- [ ] Convertir Bandeja en drawer deslizable en mobile
- [ ] Implementar scroll horizontal en Kanban para mobile
- [ ] Ajustar panel lateral para mobile
- [ ] Probar en diferentes dispositivos

---

## SPRINT 6: FILTROS, BÚSQUEDA Y POLISH (1.5 semanas)

### 6.1 Filtros por Categoría y Prioridad (RF-MVP-009)
- [ ] Crear componente components/filters/FilterDropdowns.tsx
- [ ] Implementar dropdown de categorías:
  - [ ] Todas las categorías
  - [ ] Cliente
  - [ ] Lead
  - [ ] Interno
- [ ] Implementar dropdown de prioridades:
  - [ ] Todas las prioridades
  - [ ] Urgente
  - [ ] Alta
  - [ ] Media
  - [ ] Baja
- [ ] Guardar filtros en Zustand
- [ ] Aplicar filtros a emails y tareas
- [ ] Mostrar chips de filtros activos
- [ ] Implementar botón X para limpiar filtros individuales
- [ ] Implementar botón "Limpiar todos los filtros"
- [ ] Mostrar contador de resultados
- [ ] Agregar mensaje si no hay resultados

### 6.2 Búsqueda Global (RF-MVP-010)
- [ ] Crear componente components/filters/SearchBar.tsx
- [ ] Implementar campo de búsqueda con placeholder
- [ ] Agregar debounce de 300ms
- [ ] Buscar en campos: senderId, senderName, subject
- [ ] Implementar búsqueda case-insensitive
- [ ] Buscar por palabras (split por espacios)
- [ ] Crear índices FULLTEXT en PostgreSQL
- [ ] Mostrar chip de búsqueda activa
- [ ] Implementar botón X para limpiar búsqueda
- [ ] Instalar react-highlight-words
- [ ] Implementar highlight de coincidencias en Bandeja
- [ ] Combinar búsqueda con filtros (operador AND)

### 6.3 Refinamiento de UX
- [ ] Implementar sistema de toasts con ShadCN
- [ ] Crear toasts para:
  - [ ] Importación exitosa
  - [ ] Tarea movida
  - [ ] Comentario guardado
  - [ ] Errores generales
- [ ] Implementar animaciones suaves:
  - [ ] Fade-in/out (200ms)
  - [ ] Slide transitions (300ms)
- [ ] Agregar skeletons para estados de loading:
  - [ ] Skeleton para Bandeja
  - [ ] Skeleton para Kanban
  - [ ] Skeleton para Panel Lateral
- [ ] Implementar estados vacíos con ilustraciones
- [ ] Optimizar performance con React.memo
- [ ] Implementar lazy loading de componentes pesados

### 6.4 Accesibilidad
- [ ] Verificar contraste WCAG 2.1 AA
- [ ] Implementar navegación por teclado:
  - [ ] Tab para navegar entre cards
  - [ ] Enter para abrir panel
  - [ ] ESC para cerrar panel
- [ ] Agregar ARIA labels a todos los elementos interactivos
- [ ] Probar con screen reader
- [ ] Agregar focus indicators visibles

### 6.5 Testing de Integración
- [ ] Probar flujo completo de autenticación
- [ ] Probar flujo de configuración de API Key
- [ ] Probar importación de 20 emails
- [ ] Probar clasificación con diferentes tipos de emails
- [ ] Probar drag & drop entre columnas
- [ ] Probar filtros combinados
- [ ] Probar búsqueda con acentos y caracteres especiales
- [ ] Probar comentarios (crear, editar)
- [ ] Probar cierre de sesión
- [ ] Validar performance (<2 seg carga inicial)
- [ ] Validar importación (<2 min para 20 emails)

---

## TAREAS FINALES: DEPLOY Y DOCUMENTACIÓN

### Deploy en Vercel
- [ ] Crear cuenta en Vercel
- [ ] Conectar repositorio de GitHub
- [ ] Configurar variables de entorno en Vercel:
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_URL
  - [ ] NEXTAUTH_SECRET
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] GEMINI_API_KEY
  - [ ] ENCRYPTION_KEY
  - [ ] SENTRY_DSN (opcional)
- [ ] Ejecutar primera build
- [ ] Verificar que migraciones de Prisma se ejecuten
- [ ] Configurar dominio personalizado (opcional)
- [ ] Habilitar HTTPS (automático en Vercel)
- [ ] Configurar Analytics de Vercel

### Documentación
- [ ] Crear README.md con:
  - [ ] Descripción del proyecto
  - [ ] Stack tecnológico
  - [ ] Requisitos previos
  - [ ] Instrucciones de instalación
  - [ ] Configuración de variables de entorno
  - [ ] Comandos disponibles
  - [ ] Estructura del proyecto
- [ ] Crear CONTRIBUTING.md
- [ ] Crear guía "Cómo obtener Gmail API Key" con screenshots
- [ ] Documentar API endpoints (opcional: Swagger)
- [ ] Agregar comentarios en código complejo
- [ ] Crear changelog (CHANGELOG.md)

### Monitoreo y Logging
- [ ] Configurar Sentry para error tracking
- [ ] Implementar Winston para logs estructurados
- [ ] Configurar niveles de log: info, warn, error
- [ ] Implementar rotación diaria de logs
- [ ] Crear dashboard de monitoreo básico
- [ ] Configurar alertas para errores críticos

### Seguridad Final
- [ ] Auditar todas las API routes
- [ ] Verificar que gmailApiKey esté siempre encriptada
- [ ] Validar que HTML de emails esté sanitizado
- [ ] Configurar CORS correctamente
- [ ] Implementar rate limiting:
  - [ ] Importación: 1 cada 5 minutos por usuario
  - [ ] APIs: 100 requests/minuto por usuario
- [ ] Realizar audit de dependencias (npm audit)
- [ ] Actualizar dependencias con vulnerabilidades

---

## CRITERIOS DE ACEPTACIÓN DEL MVP

### ✅ Funcionalidad Core
- [ ] Usuario puede autenticarse con Google OAuth
- [ ] Usuario puede configurar su Gmail API Key
- [ ] Usuario puede importar 20 emails manualmente
- [ ] IA clasifica emails con precisión ≥70%
- [ ] Emails clasificados aparecen en Bandeja lateral
- [ ] Tareas detectadas se muestran como cards en Kanban
- [ ] Usuario puede arrastrar cards entre columnas
- [ ] Usuario puede ver detalle completo de email
- [ ] Usuario puede agregar y editar comentarios
- [ ] Usuario puede filtrar por categoría y prioridad
- [ ] Usuario puede buscar por remitente o asunto
- [ ] Usuario puede editar su Gmail API Key
- [ ] Usuario puede cerrar sesión de forma segura

### ✅ Calidad y Performance
- [ ] Dashboard carga en <2 segundos
- [ ] Importación de 20 emails completa en <2 minutos
- [ ] No hay errores en consola del navegador
- [ ] No hay memory leaks en componentes React
- [ ] Responsive funcional en desktop y mobile

### ✅ Seguridad
- [ ] Gmail API Keys almacenadas encriptadas (AES-256)
- [ ] OAuth tokens manejados de forma segura
- [ ] HTML de emails sanitizado (prevención de XSS)
- [ ] HTTPS habilitado en producción

### ✅ Deploy y Documentación
- [ ] Aplicación deployada en Vercel
- [ ] Base de datos PostgreSQL funcional en NeonDB
- [ ] Variables de entorno configuradas correctamente
- [ ] README con instrucciones de setup
- [ ] Documentación de cómo obtener Gmail API Key

---

## RIESGOS Y MITIGACIONES

### Riesgo 1: Precisión de IA <75%
**Mitigación:**
- Testing exhaustivo con dataset de 100+ emails reales
- Refinamiento iterativo de prompts
- Implementar feedback del usuario para mejoras futuras

### Riesgo 2: Gmail API quota exceeded
**Mitigación:**
- Implementar manejo de error 429
- Mostrar mensaje claro al usuario
- Loggear en ImportLog para análisis

### Riesgo 3: Procesamiento de emails >2 minutos
**Mitigación:**
- Procesamiento en paralelo (batches de 5)
- Mostrar progreso granular al usuario
- Implementar timeout de 5 segundos por email

### Riesgo 4: Fricción en configuración de API Key
**Mitigación:**
- Crear documentación visual paso a paso
- Considerar migrar a modelo centralizado en v1.1

---

## PRÓXIMOS PASOS (POST-MVP)

### Para v1.1
- Aumentar límite de emails procesables (50-100)
- Sincronización automática cada hora
- Notificaciones básicas (in-app)
- Gestión básica de clientes
- Categorías custom

### Para v2.0
- Relación inteligente de emails con embeddings
- Multi-usuario/equipos
- Integración con CRM
- Analytics avanzados
- Mobile app nativa

---

**Fecha de creación:** 2025-11-12
**Última actualización:** 2025-11-13
**Versión:** 1.1

## RESUMEN DE PROGRESO

### ✅ SPRINT 1: COMPLETADO (100%)
- Proyecto Next.js 16 configurado con TypeScript, TailwindCSS, ESLint, Prettier
- Base de datos PostgreSQL (NeonDB) con Prisma configurada
- 8 modelos de datos implementados (User, Email, Task, Comment, ImportLog, Account, Session, VerificationToken)
- 3 migraciones ejecutadas exitosamente
- Autenticación con Google OAuth completamente funcional
- NextAuth v5 con JWT (7 días de expiración)
- Middleware de protección de rutas implementado
- Página de Login con diseño moderno y animaciones
- Página de Dashboard básica
- Componentes UI de ShadCN (button, card, separator)
- Scripts de seed y limpieza de BD
- Scopes de Gmail configurados (gmail.readonly)
- Tokens de acceso y refresh guardados en sesión

### 🚧 EN PROGRESO
- Funciones básicas de Gmail API (lib/gmail-api.ts) - Implementación parcial
- Zustand instalado pero no configurado
- Vista de dashboard básica (sin Kanban completo)

### ⏳ PENDIENTE
- Sprint 2: Vista de perfil y configuración Gmail
- Sprint 3: Integración Gemini AI y procesamiento de emails
- Sprint 4: UI Kanban completa con drag & drop
- Sprint 5: Panel lateral de detalle y comentarios
- Sprint 6: Filtros, búsqueda y polish final
