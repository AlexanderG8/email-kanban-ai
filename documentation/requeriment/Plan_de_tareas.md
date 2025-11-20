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

- [X] Crear página /app/dashboard/perfil/page.tsx
- [X] Crear layout de dashboard con header reutilizable
- [X] Implementar Card de Información Personal (readonly)
- [X] Implementar Card de Configuración de Gmail
- [X] Implementar verificación de acceso a Gmail
- [X] Mostrar estado de configuración y última importación

### 2.2 Vista de Integración de Gmail API (RF-MVP-002)

- [X] Crear página /app/(auth)/integracion/page.tsx
- [X] Verificación de estado OAuth con Gmail
- [X] Date picker para fecha de referencia (deshabilitado, valor por defecto 30 días)
- [X] Link a documentación de ayuda
- [X] Botón "Guardar y continuar"
- [X] Botón secundario "Saltar por ahora"
- [X] Validación de acceso OAuth con Gmail API
- [X] Crear lib/encryption.ts con funciones de encriptación AES-256
- [X] Crear API route /api/user/gmail-config (GET/POST)
- [X] Toast de éxito/error con sonner

### 2.3 Configuración de Zustand Store
- [X] Instalar zustand (v5.0.8)
- [X] Crear store/useStore.ts con interfaces y acciones completas
- [X] Definir interfaces: User, Email, Task, Comment, Filters, ImportProgress
- [X] Implementar state: user, emails, tasks, comments, filters, selectedTaskId, importProgress
- [X] Implementar actions: setUser, setEmails, setTasks, updateTask, setFilters, reset, etc.
- [X] Configurar persistencia con zustand/persist
- [X] Crear selectores optimizados para datos filtrados

### 2.4 Funcionalidad de Cerrar Sesión (RF-MVP-012)

- [X] Crear componente Header reutilizable con dropdown de usuario
- [X] Implementar Avatar con iniciales de fallback
- [X] Implementar modal de confirmación de cierre de sesión
- [X] Usar signOut de NextAuth para cerrar sesión
- [X] Limpiar estado de Zustand y localStorage
- [X] Implementar redirección a /login
- [X] Toast de confirmación al cerrar sesión

---

## SPRINT 3: IA Y PROCESAMIENTO DE EMAILS (2 semanas)

### 3.1 Integración con Gmail API
- [X] Usar fetch nativo para Gmail API (no googleapis)
- [X] Crear lib/gmail-api.ts con funciones completas:
  - [X] fetchGmailMessageIds(maxResults, afterDate) - Lista IDs de mensajes
  - [X] fetchGmailMessage(messageId) - Obtiene mensaje completo
  - [X] parseGmailMessage(message) - Parsear a EmailData
  - [X] fetchAndParseEmails(maxResults, afterDate, batchSize) - Fetch y parse en batches
  - [X] verifyGmailAccess() - Verifica acceso a Gmail
  - [X] getGmailProfile() - Obtiene perfil de Gmail
- [X] Implementar consulta de últimos 20 emails no procesados
- [X] Implementar filtrado por fecha (lastImportAt)
- [X] Extraer campos completos: gmailId, senderId, senderName, subject, body, snippet, receivedAt
- [X] Parsear contenido MIME (text/plain, text/html) recursivamente
- [X] Detectar attachments
- [X] Manejar errores de Gmail API con mensajes descriptivos

### 3.2 Integración con Gemini AI (RF-MVP-008)
- [X] Instalar Vercel AI SDK (ai, @ai-sdk/google)
- [X] Crear lib/gemini.ts con funciones:
  - [X] classifyEmail(emailData) - Clasifica un email
  - [X] classifyEmails(emails, onProgress) - Clasifica múltiples emails
  - [X] generateTaskTitle(email, taskDescription) - Genera título de tarea
  - [X] isGeminiConfigured() - Verifica configuración
- [X] Implementar prompt de clasificación completo (según documentación)
- [X] Usar generateObject con Zod schema para respuesta estructurada
- [X] Implementar fallback si Gemini falla (categoria: Interno, hasTask: false)
- [X] Detectar categoría: Cliente, Lead, Interno, Spam
- [X] Detectar prioridad: Urgente, Alta, Media, Baja
- [X] Detectar tareas múltiples en un solo email
- [X] Extraer dueDate si está disponible
- [X] Truncar body a 5000 caracteres para límites de tokens

### 3.3 Proceso de Importación (RF-MVP-007)
- [X] Crear API route: /api/emails/import/route.ts (POST y GET)
- [X] Implementar validación de usuario autenticado
- [X] Verificar que Gmail esté configurado (oauth_configured)
- [X] Validar que no haya importación en progreso
- [X] Implementar rate limiting (5 minutos entre importaciones)
- [X] Crear registro en ImportLog (status: processing)
- [X] Obtener emails de Gmail API (max 20) con filtro por fecha
- [X] Implementar procesamiento en batches de 5
- [X] Por cada email:
  - [X] Verificar si ya existe en BD (evitar duplicados)
  - [X] Clasificar con Gemini
  - [X] Descartar si es Spam
  - [X] Guardar en tabla emails
  - [X] Crear tareas si hasTask = true
- [X] Finalizar ImportLog (status: completed o failed)
- [X] Actualizar user.lastImportAt
- [X] Retornar resumen de importación
- [X] GET endpoint para historial de importaciones

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
- [X] Crear página /app/dashboard/page.tsx con layout completo
- [X] Implementar layout de dashboard
- [X] Crear componente Header con:
  - [X] Logo
  - [ ] Campo de búsqueda global (Sprint 6)
  - [ ] Dropdowns de filtros (Sprint 6)
  - [X] Avatar y dropdown de usuario
- [X] Implementar grid layout: Bandeja lateral + Kanban central
- [X] Crear placeholders para estado vacío

### 4.2 Bandeja Lateral de Emails
- [X] Crear componente components/kanban/EmailBandeja.tsx
- [X] Diseñar lista de emails con:
  - [X] Avatar del remitente
  - [X] Nombre del remitente
  - [X] Asunto truncado
  - [X] Badge de cantidad de tareas
  - [X] Badge de categoría
  - [X] Timestamp relativo
- [X] Implementar botón "Importar Gmails"
- [X] Agregar ícono de colapsar/expandir
- [X] Implementar funcionalidad de colapsar con animación
- [X] Mostrar solo emails con hasTask = true
- [ ] Instalar react-window para virtualización (optimización futura)
- [ ] Implementar virtualización si >50 emails (optimización futura)

### 4.3 Componentes de Kanban
- [X] Crear componente components/kanban/KanbanBoard.tsx
- [X] Crear componente components/kanban/KanbanColumn.tsx
- [X] Crear 3 columnas:
  - [X] Tareas (Pendiente)
  - [X] En Proceso (En Progreso)
  - [X] Terminado (Completado)
- [X] Implementar contadores de cards por columna
- [X] Agregar placeholders para columnas vacías
- [ ] Implementar lazy loading si >50 cards (optimización futura)

### 4.4 Cards de Tareas (RF-MVP-004)
- [X] Crear componente components/kanban/TaskCard.tsx
- [X] Diseñar estructura de card según documentación:
  - [X] Badge de prioridad (esquina superior derecha)
  - [X] Título de tarea (truncado a 2 líneas)
  - [X] Avatar y nombre del remitente
  - [X] Badge de categoría
  - [X] Footer con ícono de tareas múltiples
  - [X] Timestamp relativo
- [X] Implementar estados hover
- [X] Implementar click para abrir panel lateral (handler listo)
- [X] Agregar indicador de tareas relacionadas
- [X] Usar componentes Card de ShadCN/UI

### 4.5 Drag & Drop (RF-MVP-006)
- [X] Instalar @dnd-kit/core y @dnd-kit/sortable
- [X] Implementar DndContext en KanbanBoard
- [X] Hacer cards draggables
- [X] Implementar feedback visual durante drag:
  - [X] Opacity 0.5 en card
  - [X] Borde punteado en columnas válidas
  - [X] Cursor grabbing
- [X] Implementar drop handler
- [X] Actualizar estado en Zustand
- [X] Crear API route: /api/tasks/[id]/route.ts (GET, PATCH, DELETE)
- [X] Actualizar status en BD
- [X] Mostrar toast al mover card
- [X] Implementar rotación visual durante drag
- [ ] Agregar debounce de 300ms para BD (optimización futura)

### 4.6 Modal de Importación
- [X] Crear componente components/modals/ImportModal.tsx
- [X] Implementar modal de confirmación
- [X] Crear barra de progreso animada
- [X] Simular progreso durante importación
- [X] Mostrar resumen al finalizar importación
- [X] Manejar errores de importación
- [X] Implementar botón deshabilitado durante importación
- [X] Estados: confirm, importing, success, error

---

## SPRINT 5: DETALLE Y COMENTARIOS (1.5 semanas)

### 5.1 Panel Lateral Derecho (RF-MVP-005)
- [X] Crear componente components/panel/DetailPanel.tsx
- [X] Implementar slide-over desde la derecha (400px)
- [X] Crear animación slide-in/out (300ms)
- [X] Implementar cierre con botón X
- [X] Implementar cierre con tecla ESC
- [X] Diseñar estructura con secciones:
  - [X] Header con botón cerrar
  - [X] Sección 1: Información del Email
  - [X] Sección 2: Metadata de IA (confianza)
  - [X] Sección 3: Comentarios
  - [X] Sección 4: Acciones (cambio de estado)

### 5.2 Información del Email
- [X] Mostrar avatar y nombre del remitente
- [X] Mostrar asunto completo (no truncado)
- [X] Mostrar fecha de recepción formateada
- [X] Instalar dompurify para sanitización de HTML
- [X] Implementar sanitización del body HTML
- [X] Mostrar cuerpo del email con max-height y scroll
- [X] Mostrar badges de categoría y prioridad

### 5.3 Sistema de Comentarios
- [X] Crear API route: /api/comments/route.ts (GET, POST)
- [X] Crear API route: /api/comments/[id]/route.ts (PATCH, DELETE)
- [X] Implementar lista de comentarios
- [X] Crear campo de texto expandible
- [X] Implementar "Agregar comentario"
- [X] Guardar en tabla Comment
- [X] Mostrar comentarios con:
  - [X] Avatar del usuario
  - [X] Texto del comentario
  - [X] Timestamp relativo
  - [X] Botón de editar
- [X] Implementar funcionalidad de editar comentario
- [X] Actualizar updatedAt al editar
- [X] Mostrar indicador "editado"

### 5.4 Cambio de Estado desde Panel
- [X] Crear dropdown de cambio de estado
- [X] Implementar opciones: Pendiente, En Progreso, Completado
- [X] Agregar botón de confirmar cambio
- [X] Actualizar status en BD via /api/tasks/[id]
- [X] Mover card en Kanban automáticamente (actualiza Zustand)
- [X] Mostrar toast de confirmación
- [X] Mantener panel abierto después del cambio

### 5.5 Emails con Múltiples Tareas
- [X] Detectar si email tiene múltiples tareas
- [X] Agregar sección "Tareas Relacionadas"
- [X] Mostrar mini-cards con estado y prioridad
- [ ] Implementar navegación entre tareas del mismo email (futuro)
- [ ] Actualizar panel al cambiar de tarea (futuro)

### 5.6 Responsive Design
- [X] Panel se adapta a pantallas pequeñas (w-full sm:w-[400px])
- [ ] Adaptar layout para tablet (768px-1279px)
- [ ] Adaptar layout para mobile (375px-767px)
- [ ] Convertir Bandeja en drawer deslizable en mobile
- [ ] Implementar scroll horizontal en Kanban para mobile
- [ ] Probar en diferentes dispositivos

---

## SPRINT 6: FILTROS, BÚSQUEDA Y POLISH (1.5 semanas)

### 6.1 Filtros por Categoría y Prioridad (RF-MVP-009)
- [X] Crear componente components/filters/FilterDropdowns.tsx
- [X] Implementar dropdown de categorías:
  - [X] Todas las categorías
  - [X] Cliente
  - [X] Lead
  - [X] Interno
- [X] Implementar dropdown de prioridades:
  - [X] Todas las prioridades
  - [X] Urgente
  - [X] Alta
  - [X] Media
  - [X] Baja
- [X] Guardar filtros en Zustand
- [X] Aplicar filtros a emails y tareas (useFilteredEmails, useFilteredTasks)
- [X] Mostrar chips de filtros activos
- [X] Implementar botón X para limpiar filtros individuales
- [X] Implementar botón "Limpiar todos los filtros"
- [ ] Mostrar contador de resultados (futuro)
- [ ] Agregar mensaje si no hay resultados (futuro)

### 6.2 Búsqueda Global (RF-MVP-010)
- [X] Crear componente components/filters/SearchBar.tsx
- [X] Implementar campo de búsqueda con placeholder
- [X] Agregar debounce de 300ms
- [X] Buscar en campos: senderName, subject (client-side)
- [X] Implementar búsqueda case-insensitive
- [X] Mostrar chip de búsqueda activa
- [X] Implementar botón X para limpiar búsqueda
- [X] Combinar búsqueda con filtros (operador AND)
- [ ] Crear índices FULLTEXT en PostgreSQL (optimización futura)
- [ ] Instalar react-highlight-words (futuro)
- [ ] Implementar highlight de coincidencias en Bandeja (futuro)

### 6.3 Refinamiento de UX
- [X] Implementar sistema de toasts con Sonner
- [X] Crear toasts para:
  - [X] Importación exitosa
  - [X] Tarea movida
  - [X] Comentario guardado
  - [X] Errores generales
- [X] Implementar animaciones suaves:
  - [X] Slide transitions (300ms) en panel
  - [X] Hover transitions en cards
- [X] Agregar skeletons para estados de loading:
  - [X] Skeleton para Bandeja (EmailBandejaSkeleton)
  - [X] Skeleton para Kanban (KanbanSkeleton)
  - [X] Skeleton para Dashboard (DashboardSkeleton)
- [X] Crear componente EmptyState reutilizable
- [ ] Optimizar performance con React.memo (futuro)
- [ ] Implementar lazy loading de componentes pesados (futuro)

### 6.4 Accesibilidad
- [X] Implementar navegación por teclado:
  - [X] Tab para navegar entre cards (tabIndex)
  - [X] Enter/Space para abrir panel
  - [X] ESC para cerrar panel y limpiar búsqueda
- [X] Agregar ARIA labels a elementos interactivos:
  - [X] TaskCard con aria-label descriptivo
  - [X] KanbanColumn con role="region"
  - [X] SearchBar y FilterDropdowns con aria-labels
- [X] Agregar focus indicators visibles (focus-within:ring)
- [ ] Verificar contraste WCAG 2.1 AA (testing)
- [ ] Probar con screen reader (testing)

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
**Última actualización:** 2025-11-19
**Versión:** 1.3

## RESUMEN DE PROGRESO

### ✅ SPRINT 1: COMPLETADO (100%)
- Proyecto Next.js 16.0.2 configurado con TypeScript 5, TailwindCSS v4, ESLint 9, Prettier 3.6.2
- Base de datos PostgreSQL (NeonDB) con Prisma 6.19.0 configurada
- 8 modelos de datos implementados (User, Email, Task, Comment, ImportLog, Account, Session, VerificationToken)
- 3 migraciones ejecutadas exitosamente
- Autenticación con Google OAuth completamente funcional
- NextAuth v5.0.0-beta.30 con JWT (7 días de expiración)
- Middleware de protección de rutas implementado
- Página de Login con diseño moderno y animaciones
- Layout de auth con fondo gradiente y orbes animados
- Página de Dashboard básica con información del usuario
- Página de Integración placeholder
- Componentes UI de ShadCN (button, card, separator)
- Componentes auth (LoginButton, Logo, SessionProvider)
- Utilidades de auth (getAuthSession, getCurrentUser, hasGmailApiKey)
- Scripts de seed y limpieza de BD
- Scopes de Gmail configurados (gmail.readonly)
- Tokens de acceso y refresh guardados en sesión
- Variables de entorno configuradas (.env.example)

### ✅ SPRINT 2: COMPLETADO (100%)
- Zustand Store completo con interfaces, estado, acciones y selectores (store/useStore.ts)
- Utilidades de encriptación AES-256-GCM (lib/encryption.ts)
- API route /api/user/gmail-config para validación y configuración de Gmail OAuth
- Vista de integración completa con verificación de acceso OAuth
- Vista de perfil completa (/dashboard/perfil)
- Header reutilizable con dropdown de usuario y Avatar
- Modal de confirmación de cierre de sesión
- Dashboard actualizado con nuevo Header y cards de estado
- Logo actualizado con props de tamaño (sm, md, lg)
- Componentes ShadCN: input, label, sonner, alert, dropdown-menu, avatar, dialog

### ✅ SPRINT 3: COMPLETADO (90%)
- Gmail API completa (lib/gmail-api.ts) con parsing MIME recursivo, extracción de metadata, detección de attachments
- Vercel AI SDK instalado (ai, @ai-sdk/google)
- Gemini AI integrado (lib/gemini.ts) con Zod schemas para respuestas estructuradas
- API route /api/emails/import (POST y GET)
- Procesamiento en batches de 5 emails
- Rate limiting (5 minutos entre importaciones)
- Sistema de ImportLog completo
- Fallback cuando Gemini no está disponible
- Pendiente: Testing manual con emails reales (sección 3.4)

### ✅ SPRINT 4: COMPLETADO (90%)
- Layout principal con Bandeja lateral + Kanban central
- Componentes Kanban: KanbanBoard, KanbanColumn, TaskCard
- Componente EmailBandeja con colapso y lista de emails
- Drag & Drop completo con @dnd-kit/core y @dnd-kit/sortable
- Modal de importación con estados y progreso
- API routes: /api/emails, /api/tasks, /api/tasks/[id]
- Integración con Zustand store
- Pendiente: Virtualización para listas grandes, debounce de BD

### ✅ SPRINT 5: COMPLETADO (85%)
- Panel lateral derecho (DetailPanel) con slide-over animado
- Información completa del email con HTML sanitizado (dompurify)
- Sistema de comentarios completo (crear, editar, listar)
- API routes: /api/comments, /api/comments/[id]
- Cambio de estado desde panel con actualización en Kanban
- Sección de tareas relacionadas del mismo email
- Integración completa con Zustand y dashboard
- Pendiente: Navegación entre tareas relacionadas, responsive mobile

### ✅ SPRINT 6: COMPLETADO (80%)
- FilterDropdowns con categorías y prioridades
- SearchBar con debounce de 300ms
- Header actualizado con filtros y búsqueda integrados
- Skeletons para loading (KanbanSkeleton, EmailBandejaSkeleton, DashboardSkeleton)
- EmptyState component reutilizable
- Accesibilidad: ARIA labels, focus indicators, navegación por teclado
- Toasts con Sonner para feedback
- Pendiente: Highlight de búsqueda, contador de resultados, testing manual

### 🔜 PRÓXIMO: Testing y Deploy
- Testing de integración manual
- Deploy en Vercel
- Documentación final

### 📦 DEPENDENCIAS INSTALADAS EN SPRINT 3
- ai ^4.3.16 (Vercel AI SDK)
- @ai-sdk/google ^1.2.22 (Proveedor de Gemini)
- zod ^3.25.51 (Validación de schemas)

### 📦 DEPENDENCIAS INSTALADAS EN SPRINT 4
- @dnd-kit/core (Drag & Drop base)
- @dnd-kit/sortable (Sortable para listas)
- @dnd-kit/utilities (CSS utilities)
- date-fns (Formateo de fechas relativas)

### 📦 DEPENDENCIAS INSTALADAS EN SPRINT 5
- dompurify (Sanitización HTML)
- @types/dompurify (TypeScript types)

### 📦 DEPENDENCIAS PENDIENTES DE INSTALAR
- react-window (Virtualización de listas - optimización)
- react-highlight-words (Resaltado de búsqueda - Sprint 6)
