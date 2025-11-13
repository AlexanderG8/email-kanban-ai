EMAIL-TO-KANBAN MVP: ESPECIFICACIÓN DE REQUERIMIENTOS
INFORMACIÓN GENERAL DEL PRODUCTO
Objetivo del MVP: Validar el concepto de clasificación automática de emails con IA mediante un flujo simplificado que permita a ejecutivos comerciales gestionar tareas derivadas de sus últimos 20 emails.
Usuarios Objetivo: Ejecutivos comerciales con baja madurez digital.
Stack Tecnológico:

Frontend: React, Next.js, Zod, Zustand, TailwindCSS, ShadCN
Backend: PostgreSQL (NeonDB), Prisma
IA: Vercel AI SDK + Gemini
Integraciones: Gmail API (Google Cloud)
Deploy: Vercel

Límites del MVP:

Máximo 20 emails procesables por importación
Sin sincronización automática (solo manual)
Sin notificaciones
Sin relación inteligente de emails
Sin sistema de clientes predefinidos


MÓDULO 1: AUTENTICACIÓN Y ONBOARDING
RF-MVP-001: Autenticación con Google
Historia de Usuario:

Como ejecutivo comercial, quiero autenticarme con mi cuenta de Google, para acceder a la aplicación de forma segura.

Criterios de Aceptación:
gherkinEscenario 1: Primera visita - Login exitoso
  Dado que soy un usuario nuevo sin sesión activa
  Cuando accedo a la URL de la aplicación
  Entonces veo la vista de Login con:
    - Logo de la aplicación
    - Título: "Bienvenido a Email-to-Kanban"
    - Botón: "Iniciar sesión con Google" (con ícono de Google)
  Y al hacer clic en el botón, se abre el flujo OAuth2 de Google
  Y después de autorizar correctamente, la aplicación verifica si existo en la BD

Escenario 2: Usuario nuevo - Redirección a integración
  Dado que completé la autenticación OAuth
  Y NO existo en la base de datos
  Cuando la aplicación valida mi cuenta
  Entonces:
    - Se crea automáticamente mi registro en la tabla users con:
      * email (desde Google)
      * name (desde Google)
      * picture (URL de foto de perfil de Google)
      * gmailApiKey: null
      * createdAt: fecha actual
    - Soy redirigido a la vista de "Integración de Gmail API"

Escenario 3: Usuario existente - Redirección a vista principal
  Dado que completé la autenticación OAuth
  Y ya existo en la base de datos
  Cuando la aplicación valida mi cuenta
  Entonces soy redirigido directamente a la "Vista Principal (Kanban)"
  Y mi sesión queda activa

Escenario 4: Permisos OAuth insuficientes
  Dado que estoy en el flujo de autenticación
  Cuando NO otorgo los permisos de lectura de Gmail
  Entonces veo un mensaje de error:
    "Necesitamos acceso a tu Gmail para funcionar. Por favor, autoriza los permisos requeridos."
  Y puedo reintentar la autenticación haciendo clic en el botón nuevamente
Requerimientos No Funcionales:

Seguridad: OAuth 2.0 con scope gmail.readonly
Sesión: Token JWT con expiración de 7 días
Performance: Validación de usuario <500ms


RF-MVP-002: Integración de Gmail API Key
Historia de Usuario:

Como usuario nuevo, quiero configurar mi Gmail API Key, para que la aplicación pueda leer mis emails.

Criterios de Aceptación:
gherkinEscenario 1: Vista de integración inicial
  Dado que soy redirigido a la vista de integración
  Entonces veo un formulario con:
    - Título: "Configura tu integración con Gmail"
    - Subtítulo explicativo: "Para comenzar, necesitamos tu API Key de Google Cloud. No te preocupes, tus datos están seguros y encriptados."
    - Link: "¿Cómo obtener mi API Key?" (abre documentación en nueva pestaña)
    - Campo de texto: "Gmail API Key" (type="password", placeholder="Pega aquí tu API Key")
    - Date picker: "Fecha de referencia" (deshabilitado, valor por defecto: 30 días atrás)
    - Texto informativo: "Esta fecha es referencial para futuras funcionalidades"
    - Botón: "Guardar y continuar" (deshabilitado hasta que se ingrese la API Key)
    - Botón secundario: "Saltar por ahora" (link a vista principal sin funcionalidad de importación)

Escenario 2: Guardar API Key válida
  Dado que ingreso una API Key en el campo de texto
  Cuando hago clic en "Guardar y continuar"
  Entonces:
    - Se muestra un loader: "Validando API Key..."
    - La API Key se encripta con AES-256
    - Se guarda en la tabla users (campo gmailApiKey)
    - La fecha seleccionada se guarda en el campo referenceDate
    - Soy redirigido a la "Vista Principal (Kanban)"
    - Veo un toast de éxito: "¡Configuración completa! Ya puedes importar tus emails."

Escenario 3: API Key inválida o sin permisos
  Dado que ingreso una API Key incorrecta
  Cuando hago clic en "Guardar y continuar"
  Entonces:
    - Se intenta validar haciendo una petición de prueba a Gmail API
    - Si falla, veo un mensaje de error debajo del campo:
      "La API Key es inválida o no tiene permisos para Gmail. Verifica e intenta nuevamente."
    - El campo se pone en estado de error (borde rojo)
    - NO se guarda en la base de datos
    - Permanezco en la vista de integración

Escenario 4: Saltar configuración
  Dado que hago clic en "Saltar por ahora"
  Entonces:
    - Soy redirigido a la Vista Principal
    - NO puedo usar el botón "Importar Gmails" (aparece deshabilitado con tooltip: "Configura tu API Key primero")
    - En el header veo un banner amarillo: "⚠️ Configura tu Gmail API para comenzar" con botón "Configurar ahora"
Requerimientos No Funcionales:

Seguridad: Encriptar gmailApiKey con algoritmo AES-256 antes de guardar en BD
Validación: Timeout de 10 segundos para prueba de conexión con Gmail API
UX: Mostrar progreso visual durante validación


MÓDULO 2: VISTA PRINCIPAL (KANBAN)
RF-MVP-003: Layout Principal con Bandeja y Kanban
Historia de Usuario:

Como ejecutivo comercial, quiero ver mis emails y tareas organizados visualmente, para entender rápidamente qué debo atender.

Criterios de Aceptación:
gherkinEscenario 1: Carga inicial de vista principal (sin datos)
  Dado que accedo a la Vista Principal por primera vez
  Y aún no he importado emails
  Entonces veo:
    - Header compacto con:
      * Logo de la app (esquina superior izquierda)
      * Campo de búsqueda global (centro)
      * Dropdowns de filtros: "Categoría" y "Prioridad" (centro-derecha)
      * Avatar y nombre del usuario (esquina superior derecha, clickeable)
    - Columna lateral izquierda (300px de ancho, colapsable con ícono) con:
      * Título: "Bandeja de Emails"
      * Mensaje placeholder: "No hay emails importados. Haz clic en 'Importar Gmails' para comenzar."
      * Botón: "Importar Gmails" (parte inferior de la columna)
    - Zona central (Kanban) con 3 columnas:
      * "Tareas" (status: Pendiente)
      * "En Proceso" (status: En Progreso)
      * "Terminado" (status: Completado)
      * Cada columna muestra placeholder: "Arrastra tareas aquí"
    - Panel lateral derecho: oculto inicialmente

Escenario 2: Vista con datos cargados
  Dado que ya importé 20 emails
  Y se detectaron 15 emails con tareas (total de 18 tareas)
  Entonces:
    - La Bandeja lateral muestra lista de 15 emails con:
      * Avatar del remitente (primera letra del nombre si no hay foto)
      * Nombre del remitente (bold)
      * Asunto del email (truncado a 40 chars)
      * Badge pequeño con cantidad de tareas: "2 tareas" (si tiene múltiples)
      * Badge de categoría: color según Cliente/Lead/Interno
      * Timestamp: "hace 2 horas" (relativo)
    - El Kanban muestra 18 cards distribuidas:
      * Columna "Tareas": 12 cards
      * Columna "En Proceso": 0 cards (vacío)
      * Columna "Terminado": 0 cards (vacío)
    - Los 5 emails sin tareas NO aparecen en la Bandeja

Escenario 3: Colapsar/expandir columna lateral
  Dado que estoy en la Vista Principal
  Cuando hago clic en el ícono de colapsar (←) en la Bandeja
  Entonces:
    - La columna se oculta con animación (transition 300ms)
    - El Kanban se expande para ocupar el espacio completo
    - El ícono cambia a (→) para expandir nuevamente
  Y al hacer clic nuevamente, la Bandeja vuelve a aparecer
Requerimientos No Funcionales:

Responsive: En móvil (<768px), la Bandeja se convierte en drawer deslizable desde la izquierda
Performance: Virtualización de lista si Bandeja tiene >50 emails (react-window)
Animaciones: Transiciones suaves (200-300ms) para mejorar UX


RF-MVP-004: Cards de Tareas en Kanban
Historia de Usuario:

Como ejecutivo comercial, quiero ver cada tarea como una tarjeta visual, para identificar rápidamente su prioridad y contexto.

Criterios de Aceptación:
gherkinEscenario 1: Estructura de una card de tarea
  Dado que hay una tarea en el Kanban
  Entonces cada card muestra:
    - Header de la card:
      * Badge de prioridad en esquina superior derecha:
        - "Urgente" (rojo, text-xs)
        - "Alta" (naranja)
        - "Media" (amarillo)
        - "Baja" (gris)
    - Cuerpo de la card:
      * Asunto del email (font-semibold, truncado a 2 líneas)
      * Nombre del remitente con avatar pequeño
      * Badge de categoría: "Cliente" | "Lead" | "Interno" (colores distintivos)
    - Footer de la card (si aplica):
      * Ícono de clip + "2 tareas" (si el email tiene múltiples tareas relacionadas)
      * Timestamp: "hace 3 días"
    - Hover state: Sombra elevada y cursor pointer

Escenario 2: Email con múltiples tareas
  Dado que un email de "Carlos Romano" tiene 3 tareas detectadas:
    1. "Enviar proforma del Producto X"
    2. "Agendar llamada con Carlos"
    3. "Enviar documentación técnica"
  Entonces:
    - Aparecen 3 cards independientes en la columna "Tareas"
    - Todas tienen el mismo remitente: "Carlos Romano"
    - Todas tienen el mismo asunto original del email
    - Cada card tiene una descripción única (generada por IA)
    - Las 3 cards tienen un badge: "🔗 Relacionadas" (en hover muestra: "Este email tiene 3 tareas")

Escenario 3: Click en una card
  Dado que hago clic en cualquier card del Kanban
  Entonces:
    - La card se resalta visualmente (borde azul)
    - Se abre el Panel Lateral Derecho (slide-over) mostrando:
      * Detalle completo del email asociado
      * Metadata de IA
      * Opciones de acción
Requerimientos No Funcionales:

Diseño: Usar componentes Card de ShadCN/UI
Accesibilidad: Cards navegables con teclado (Tab + Enter)
Performance: Lazy loading para >50 cards por columna


RF-MVP-005: Panel Lateral Derecho (Detalle)
Historia de Usuario:

Como ejecutivo comercial, quiero ver el detalle completo del email seleccionado, para entender el contexto y tomar acciones.

Criterios de Aceptación:
gherkinEscenario 1: Abrir panel desde card del Kanban
  Dado que hago clic en una card de tarea
  Entonces se abre un slide-over desde la derecha (400px de ancho) que muestra:
    - Header del panel:
      * Botón "✕ Cerrar" (esquina superior derecha)
      * Título: "Detalle del Email"
    - Sección 1: Información del Email
      * Avatar y nombre del remitente
      * Asunto del email (texto completo, no truncado)
      * Fecha de recepción: "Recibido el 10 de nov, 2025 a las 14:30"
      * Cuerpo del email (formato HTML sanitizado, max-height 300px con scroll)
    - Sección 2: Metadata de IA
      * Badge de Categoría: "Cliente" con color
      * Badge de Prioridad: "Alta" con color
      * Campo: "Descripción de la tarea" (generada por IA)
        - Ejemplo: "El cliente solicita una demo del producto X para mañana"
    - Sección 3: Comentarios
      * Lista de comentarios previos (si existen)
      * Campo de texto: "Agregar comentario..." (expandible al hacer focus)
      * Botón: "Guardar comentario"
    - Sección 4: Acciones
      * Dropdown: "Cambiar estado de tarea"
        - Opciones: Tareas | En Proceso | Terminado
      * Botón: "Guardar cambios"

Escenario 2: Abrir panel desde Bandeja de Emails
  Dado que hago clic en un email de la Bandeja lateral
  Entonces:
    - Se abre el mismo slide-over con la información del email
    - Si el email tiene múltiples tareas, se muestra:
      * Sección adicional: "Tareas asociadas (3)"
      * Lista de las 3 tareas como mini-cards clickeables
      * Al hacer clic en una mini-card, el panel se actualiza para mostrar esa tarea específica

Escenario 3: Agregar comentario a tarea
  Dado que estoy viendo el detalle de una tarea
  Cuando escribo en el campo "Agregar comentario..." y hago clic en "Guardar comentario"
  Entonces:
    - El comentario se guarda en la tabla task_comments con:
      * userId (usuario actual)
      * taskId
      * content (texto del comentario)
      * createdAt (timestamp actual)
    - El comentario aparece inmediatamente en la lista con:
      * Avatar del usuario
      * Texto del comentario
      * Timestamp: "hace unos segundos"
      * Botón de editar (ícono lápiz, solo visible en hover)

Escenario 4: Editar comentario
  Dado que veo mi propio comentario en la lista
  Cuando hago clic en el ícono de editar
  Entonces:
    - El texto del comentario se convierte en campo editable
    - Aparecen botones: "Guardar" y "Cancelar"
    - Al guardar, se actualiza el campo updatedAt en la BD
    - El comentario muestra: "editado" junto al timestamp

Escenario 5: Cambiar estado de tarea
  Dado que una tarea está en estado "Tareas" (Pendiente)
  Cuando cambio el dropdown a "En Proceso" y hago clic en "Guardar cambios"
  Entonces:
    - El estado de la tarea se actualiza en la BD
    - La card se mueve automáticamente a la columna "En Proceso" en el Kanban
    - Se muestra un toast: "Tarea movida a En Proceso"
    - El panel lateral permanece abierto mostrando el nuevo estado
Requerimientos No Funcionales:

UX: Animación de slide-in/out (300ms ease-in-out)
Performance: Sanitizar HTML del email con biblioteca (DOMPurify) para evitar XSS
Accesibilidad: Cerrar panel con tecla ESC


RF-MVP-006: Drag & Drop entre Columnas
Historia de Usuario:

Como ejecutivo comercial, quiero arrastrar tareas entre columnas, para actualizar su estado de forma visual e intuitiva.

Criterios de Aceptación:
gherkinEscenario 1: Arrastrar card a otra columna exitosamente
  Dado que tengo una card en la columna "Tareas"
  Cuando la arrastro y suelto en la columna "En Proceso"
  Entonces:
    - La card se mueve visualmente a la nueva columna con animación
    - Se actualiza el campo status en la BD: "Pendiente" → "En Progreso"
    - Se actualiza el campo updatedAt de la tarea
    - Se muestra un toast sutil: "Tarea movida a En Proceso"

Escenario 2: Validación de movimientos
  Dado que intento arrastrar una card
  Cuando la suelto fuera de una columna válida
  Entonces:
    - La card vuelve a su posición original con animación de "rebote"
    - NO se actualiza la base de datos
    - No se muestra mensaje de error (comportamiento silencioso)

Escenario 3: Feedback visual durante drag
  Dado que comienzo a arrastrar una card
  Entonces:
    - La card se vuelve semi-transparente (opacity: 0.5)
    - Las columnas válidas muestran un borde punteado azul
    - El cursor cambia a "grabbing"
  Y al soltar:
    - La card recupera opacity: 1
    - Los bordes punteados desaparecen
Requerimientos No Funcionales:

Librería: Usar @dnd-kit/core para drag & drop
Performance: Debounce de actualización a BD (300ms) para evitar múltiples requests
Mobile: En táctil, mantener presionado 500ms para activar drag


MÓDULO 3: IMPORTACIÓN Y CLASIFICACIÓN
RF-MVP-007: Importar Gmails con IA
Historia de Usuario:

Como ejecutivo comercial, quiero importar mis últimos emails y que se clasifiquen automáticamente, para ver tareas accionables sin esfuerzo manual.

Criterios de Aceptación:
gherkinEscenario 1: Click en "Importar Gmails" exitoso
  Dado que tengo configurada mi Gmail API Key
  Y estoy en la Vista Principal
  Cuando hago clic en el botón "Importar Gmails" (en la Bandeja lateral)
  Entonces:
    - Se muestra un modal de confirmación:
      * Título: "Importar últimos 20 emails"
      * Mensaje: "Esto procesará tus últimos 20 emails no importados. El proceso puede tomar 1-2 minutos."
      * Botón: "Iniciar importación"
      * Botón: "Cancelar"

Escenario 2: Proceso de importación en progreso
  Dado que hice clic en "Iniciar importación"
  Entonces:
    - El modal cambia a mostrar:
      * Barra de progreso animada: "Procesando emails... 5/20"
      * Mensaje: "Analizando con IA... Por favor no cierres esta ventana"
    - En background se ejecuta:
      1. Consulta a Gmail API: obtener últimos 20 emails no procesados (usando gmailApiKey del usuario)
      2. Por cada email:
         a. Extraer: senderId, senderName, subject, body, receivedAt
         b. Llamar a Gemini API con prompt de clasificación
         c. Guardar email en tabla emails
         d. Si IA detecta tarea(s), guardar en tabla tasks
         e. Actualizar progreso

Escenario 3: Importación completada exitosamente
  Dado que el proceso finalizó
  Entonces:
    - El modal muestra:
      * Ícono de éxito ✓
      * Mensaje: "¡Importación completada!"
      * Resumen:
        - "20 emails procesados"
        - "15 emails con tareas detectadas"
        - "18 tareas creadas"
        - "5 emails informativos (sin tarea)"
      * Botón: "Ver resultados"
    - Al hacer clic en "Ver resultados":
      * El modal se cierra
      * La Bandeja se actualiza mostrando los 15 emails con tareas
      * El Kanban muestra las 18 cards en columna "Tareas"
      * Se actualiza el campo lastImportAt en tabla users

Escenario 4: Importación sin nuevos emails
  Dado que ya importé recientemente
  Y no hay nuevos emails desde la última importación
  Cuando hago clic en "Importar Gmails"
  Entonces:
    - Se muestra un toast informativo: "No hay nuevos emails para importar"
    - NO se abre modal
    - NO se hace llamada a Gmail API

Escenario 5: Error en Gmail API (API Key inválida)
  Dado que mi Gmail API Key expiró o es inválida
  Cuando intento importar
  Entonces:
    - El proceso falla en el primer intento de consulta
    - Se muestra modal de error:
      * Ícono de error ✗
      * Mensaje: "No pudimos conectar con Gmail. Tu API Key parece ser inválida o expiró."
      * Botón: "Ir a Perfil para actualizar API Key"
      * Botón: "Cerrar"
    - NO se guardan datos en la BD

Escenario 6: Botón deshabilitado sin API Key
  Dado que NO configuré mi Gmail API Key
  Cuando intento hacer clic en "Importar Gmails"
  Entonces:
    - El botón aparece deshabilitado (opacity: 0.5, cursor: not-allowed)
    - Al hacer hover, un tooltip muestra: "Configura tu Gmail API Key desde tu Perfil primero"
Requerimientos No Funcionales:

Performance: Procesamiento máximo 2 minutos para 20 emails
Rate Limiting: Máximo 1 importación cada 5 minutos por usuario
Concurrencia: Procesar emails en paralelo (batches de 5) para acelerar
Logging: Registrar cada importación en tabla import_logs para auditoría


RF-MVP-008: Clasificación con IA (Gemini)
Historia de Usuario:

Como sistema, quiero clasificar emails automáticamente usando IA, para extraer tareas, categorías y prioridades sin intervención humana.

Criterios de Aceptación:
gherkinEscenario 1: Email de cliente con tarea detectada
  Dado que la IA procesa un email con:
    - Remitente: "Carlos Romano <carlos@empresa.com>"
    - Asunto: "Solicitud de demo producto X"
    - Cuerpo: "Hola Bruno, me gustaría agendar una demo del producto X para mañana a las 3pm. ¿Es posible?"
  Cuando Gemini analiza el contenido
  Entonces retorna JSON:
```
    {
      "category": "Cliente",
      "priority": "Alta",
      "hasTask": true,
      "taskDescription": "Agendar demo de producto X con Carlos para mañana a las 3pm",
      "confidence": 92
    }
```
  Y el sistema:
    - Crea registro en tabla emails con category="Cliente"
    - Crea registro en tabla tasks con:
      * title: "Demo producto X - Carlos Romano"
      * description: "Agendar demo de producto X con Carlos para mañana a las 3pm"
      * priority: "Alta"
      * status: "Pendiente"
      * dueDate: fecha_actual + 1 día 15:00

Escenario 2: Email con múltiples tareas
  Dado que el email contiene:
    "Bruno, necesito: 1) Cotización del producto Y, 2) Llamada para discutir términos, 3) Enviar contrato a legal@empresa.com"
  Cuando Gemini lo analiza
  Entonces retorna:
```
    {
      "category": "Cliente",
      "priority": "Alta",
      "hasTask": true,
      "tasks": [
        { "description": "Generar cotización producto Y", "priority": "Alta" },
        { "description": "Llamar a Carlos para discutir términos", "priority": "Media" },
        { "description": "Enviar contrato a legal@empresa.com", "priority": "Media" }
      ],
      "confidence": 88
    }
```
  Y el sistema crea 3 tareas independientes vinculadas al mismo emailId

Escenario 3: Email de lead nuevo
  Dado que llega email de "nuevo@prospecto.com"
  Y el contenido indica interés comercial: "Hola, vi su producto en LinkedIn. ¿Podrían enviarme más información?"
  Cuando la IA clasifica
  Entonces:
    - category: "Lead"
    - priority: "Media"
    - hasTask: true
    - taskDescription: "Enviar información del producto a nuevo prospecto"

Escenario 4: Email interno sin tarea
  Dado que llega email de "colega@miempresa.com"
  Y es informativo: "FYI: La reunión de mañana se pospuso para el viernes"
  Cuando la IA clasifica
  Entonces:
    - category: "Interno"
    - hasTask: false
  Y el sistema:
    - Guarda el email en la BD
    - NO crea ninguna tarea
    - El email NO aparece en la Bandeja (solo se muestran emails con tareas)

Escenario 5: Email spam
  Dado que llega email promocional: "¡OFERTA INCREÍBLE! Compra ahora y gana $1000"
  Cuando la IA clasifica
  Entonces:
    - category: "Spam"
  Y el sistema:
    - NO guarda el email en la BD
    - NO crea tareas
    - Se registra en logs como "descartado"
Prompts de IA para Gemini:
typescriptconst classificationPrompt = `
Eres un asistente experto en clasificación de emails comerciales.

Analiza este email y extrae información estructurada:

DATOS DEL EMAIL:
- Remitente: ${senderName} <${senderEmail}>
- Asunto: ${subject}
- Cuerpo: ${body}
- Fecha de recepción: ${receivedAt}

Fecha actual del sistema: ${new Date().toISOString()}

INSTRUCCIONES:
1. Clasifica el email en UNA categoría:
   - "Cliente": Solicitud o consulta de cliente conocido/existente
   - "Lead": Nuevo prospecto mostrando interés comercial
   - "Interno": Comunicación del equipo o administrativa
   - "Spam": Sin valor comercial (promociones, newsletters no solicitados)

2. Determina si hay tarea(s) accionable(s):
   - Una tarea es cualquier acción que el destinatario debe realizar
   - Ejemplos: agendar reunión, enviar cotización, hacer seguimiento, llamar, etc.
   - Si hay múltiples acciones, sepáralas como tareas individuales

3. Asigna prioridad basándote en:
   - "Urgente": Contiene palabras como "urgente", "hoy", "ASAP" o deadline <24 horas
   - "Alta": Deadline entre 1-7 días o solicitud importante de cliente
   - "Media": Deadline >7 días o sin urgencia explícita
   - "Baja": Informativo con acción opcional

4. IMPORTANTE: Si el email tiene >2 días de antigüedad y menciona fechas relativas como "mañana" o "hoy", considera que ya expiró y NO marques como tarea.

FORMATO DE RESPUESTA (JSON estricto, sin markdown):
```
{
  "category": "Cliente" | "Lead" | "Interno" | "Spam",
  "priority": "Urgente" | "Alta" | "Media" | "Baja",
  "hasTask": true | false,
  "tasks": [
    {
      "description": "descripción clara de la tarea (max 150 caracteres)",
      "priority": "Urgente" | "Alta" | "Media" | "Baja",
      "dueDate": "ISO date string o null"
    }
  ],
  "confidence": 0-100
}
```

Si NO hay tarea, retorna: 
```
{ "category": "...", "hasTask": false, "confidence": ... };
```
Requerimientos No Funcionales:

Precisión: Tasa de clasificación correcta ≥75% (validar en fase de testing)
Timeout: Máximo 5 segundos por email antes de marcar como "error de clasificación"
Fallback: Si Gemini falla, clasificar como "Interno" + hasTask: false + confidence: 0
Costo: Monitorear tokens consumidos (objetivo: <500 tokens por email)


MÓDULO 4: FILTROS Y BÚSQUEDA
RF-MVP-009: Filtros por Categoría y Prioridad
Historia de Usuario:

Como ejecutivo comercial, quiero filtrar mis emails y tareas por categoría y prioridad, para enfocarme en lo más relevante.

Criterios de Aceptación:
Escenario 1: Filtrar por categoría
  Dado que tengo emails de distintas categorías (5 Cliente, 3 Lead, 2 Interno)
  Y tareas correspondientes en el Kanban
  Cuando selecciono "Cliente" en el dropdown de categorías del header
  Entonces:
    - La Bandeja lateral muestra SOLO los 5 emails de categoría "Cliente"
    - El Kanban muestra SOLO las tareas asociadas a esos 5 emails
    - Los filtros activos se muestran como chips debajo del header: "Categoría: Cliente" con botón ✕ para limpiar
    - El contador de resultados muestra: "5 emails | 7 tareas"

Escenario 2: Filtrar por prioridad
  Dado que tengo tareas con distintas prioridades (10 Alta, 5 Media, 3 Baja)
  Cuando selecciono "Alta" en el dropdown de prioridades
  Entonces:
    - La Bandeja muestra emails que tienen al menos una tarea de prioridad "Alta"
    - El Kanban muestra SOLO las 10 tareas con prioridad "Alta"
    - Se muestra chip: "Prioridad: Alta"

Escenario 3: Combinar filtros (Categoría + Prioridad)
  Dado que selecciono "Cliente" en categoría Y "Urgente" en prioridad
  Entonces:
    - Se aplican ambos filtros simultáneamente (operador AND)
    - La Bandeja muestra emails de clientes con al menos una tarea urgente
    - El Kanban muestra solo tareas que cumplan: category="Cliente" AND priority="Urgente"
    - Se muestran 2 chips: "Categoría: Cliente" y "Prioridad: Urgente"
    - Contador: "3 emails | 4 tareas"

Escenario 4: Limpiar filtros individualmente
  Dado que tengo filtros activos
  Cuando hago clic en la ✕ del chip "Categoría: Cliente"
  Entonces:
    - Se remueve solo ese filtro
    - El filtro de prioridad permanece activo
    - La vista se actualiza mostrando todos los emails con prioridad urgente (sin importar categoría)

Escenario 5: Limpiar todos los filtros
  Dado que tengo múltiples filtros activos
  Cuando hago clic en el botón "Limpiar filtros" (visible junto a los chips)
  Entonces:
    - Se remueven todos los filtros
    - La Bandeja y Kanban muestran todos los emails/tareas
    - Los chips desaparecen
    - Los dropdowns vuelven a su estado por defecto: "Todas las categorías" y "Todas las prioridades"

Escenario 6: Estado de filtros vacío
  Dado que aplico filtros muy restrictivos (ej: "Lead" + "Urgente")
  Y no hay resultados que cumplan ambos criterios
  Entonces:
    - La Bandeja muestra mensaje: "No hay emails que coincidan con los filtros aplicados"
    - El Kanban muestra placeholder en cada columna: "Sin resultados"
    - Los filtros permanecen visibles para que el usuario pueda ajustarlos
    - Contador: "0 emails | 0 tareas"
Requerimientos No Funcionales:

Performance: Filtrado debe ser instantáneo (<100ms) usando índices en BD
UX: Animación suave al aplicar/remover filtros (fade-in/out 200ms)
Persistencia: Guardar filtros activos en Zustand (no en URL ni BD para MVP)


RF-MVP-010: Búsqueda Global
Historia de Usuario:

Como ejecutivo comercial, quiero buscar emails por asunto o remitente, para encontrar rápidamente información específica.

Criterios de Aceptación:
gherkinEscenario 1: Búsqueda por remitente exitosa
  Dado que tengo 15 emails en mi Bandeja
  Cuando escribo "Carlos" en el campo de búsqueda del header
  Entonces:
    - La búsqueda se ejecuta en tiempo real (debounce de 300ms)
    - La Bandeja muestra SOLO emails cuyo remitente contenga "Carlos" (case-insensitive)
    - El Kanban muestra SOLO tareas asociadas a esos emails
    - Se muestra un chip: "🔍 Buscando: Carlos" con botón ✕
    - Contador: "2 emails | 3 tareas encontradas"

Escenario 2: Búsqueda por asunto
  Dado que escribo "demo producto"
  Entonces:
    - Se busca en el campo subject de la tabla emails
    - Se muestran todos los emails cuyo asunto contenga "demo" O "producto" (búsqueda por palabras)
    - Se resaltan las palabras coincidentes en la Bandeja (highlight amarillo)

Escenario 3: Búsqueda sin resultados
  Dado que escribo "xyz123" (texto que no existe)
  Entonces:
    - La Bandeja muestra: "No se encontraron resultados para 'xyz123'"
    - El Kanban muestra columnas vacías
    - Se sugiere: "Intenta con otros términos o limpia los filtros"

Escenario 4: Combinar búsqueda con filtros
  Dado que tengo filtro activo: "Categoría: Cliente"
  Y escribo "Carlos" en la búsqueda
  Entonces:
    - Se aplican ambos criterios: category="Cliente" AND (sender LIKE '%Carlos%' OR subject LIKE '%Carlos%')
    - Se muestran chips: "Categoría: Cliente" y "🔍 Buscando: Carlos"

Escenario 5: Limpiar búsqueda
  Dado que tengo una búsqueda activa
  Cuando hago clic en el ícono ✕ dentro del campo de búsqueda
  O borro manualmente el texto
  Entonces:
    - La búsqueda se limpia
    - La vista vuelve a mostrar todos los emails (respetando filtros activos si los hay)
    - El chip de búsqueda desaparece

Escenario 6: Búsqueda vacía
  Dado que el campo de búsqueda está vacío
  Entonces:
    - NO se aplica ningún filtro de búsqueda
    - Se muestran todos los emails normalmente
    - El placeholder del campo dice: "Buscar por remitente o asunto..."
Requerimientos No Funcionales:

Performance: Usar índices FULLTEXT en PostgreSQL para búsquedas rápidas
Debounce: 300ms antes de ejecutar búsqueda (evitar queries excesivas mientras el usuario escribe)
Highlight: Usar librería como react-highlight-words para resaltar coincidencias


MÓDULO 5: PERFIL Y CONFIGURACIÓN
RF-MVP-011: Vista de Perfil de Usuario
Historia de Usuario:

Como ejecutivo comercial, quiero ver y editar mi información de perfil, para mantener actualizada mi configuración.

Criterios de Aceptación:
gherkinEscenario 1: Acceder a la vista de Perfil
  Dado que estoy en cualquier vista de la aplicación
  Cuando hago clic en mi avatar/nombre en el header
  Entonces se despliega un dropdown con opciones:
    - "Ver Perfil" (con ícono de usuario)
    - "Cerrar sesión" (con ícono de salida)
  Y al hacer clic en "Ver Perfil":
    - Soy redirigido a la ruta /perfil
    - La URL cambia pero el layout se mantiene (header visible)

Escenario 2: Vista de Perfil - Sección de información personal
  Dado que estoy en /perfil
  Entonces veo una página con:
    - Título: "Mi Perfil"
    - Card 1: "Información Personal" (readonly)
      * Foto de perfil (circular, 80px de diámetro)
      * Nombre completo (del OAuth de Google, no editable)
      * Email (del OAuth de Google, no editable)
      * Texto informativo: "Esta información proviene de tu cuenta de Google y no puede editarse aquí"
    - Card 2: "Configuración de Gmail"
      * Campo de texto: "Gmail API Key" (type="password", valor actual enmascarado: "••••••••••••")
      * Botón: "👁️ Mostrar" (toggle para ver/ocultar API Key)
      * Campo date picker: "Fecha de referencia" (valor actual, deshabilitado)
      * Texto: "Esta fecha es informativa para futuras funcionalidades"
      * Botón: "Editar API Key" (primario)

Escenario 3: Editar Gmail API Key
  Dado que hago clic en "Editar API Key"
  Entonces:
    - El campo de texto se vuelve editable
    - El placeholder cambia a: "Pega tu nueva API Key aquí"
    - Aparecen botones: "Guardar cambios" y "Cancelar"
    - El botón "Editar API Key" se oculta

Escenario 4: Guardar nueva API Key válida
  Dado que ingreso una nueva API Key en el campo
  Cuando hago clic en "Guardar cambios"
  Entonces:
    - Se muestra loader: "Validando nueva API Key..."
    - Se intenta hacer una petición de prueba a Gmail API
    - Si es válida:
      * Se encripta y actualiza en la BD
      * Se muestra toast de éxito: "API Key actualizada correctamente"
      * El campo vuelve a estado readonly con valor enmascarado
    - Si es inválida:
      * Se muestra error: "La API Key no es válida. Verifica e intenta nuevamente."
      * El campo permanece editable para corrección

Escenario 5: Cancelar edición
  Dado que estoy editando la API Key
  Cuando hago clic en "Cancelar"
  Entonces:
    - Los cambios se descartan
    - El campo vuelve a mostrar el valor original enmascarado
    - Los botones de edición desaparecen
    - El botón "Editar API Key" reaparece

Escenario 6: Mostrar/Ocultar API Key
  Dado que hago clic en el botón "👁️ Mostrar"
  Entonces:
    - El campo muestra el valor completo de la API Key (desencriptado)
    - El botón cambia a "🙈 Ocultar"
  Y al hacer clic nuevamente:
    - El valor vuelve a enmascararse
    - El botón vuelve a "👁️ Mostrar"
Requerimientos No Funcionales:

Seguridad: Nunca enviar API Key desencriptada al frontend (solo verificar en backend)
UX: Validación en tiempo real del formato de API Key (longitud mínima, caracteres válidos)


RF-MVP-012: Cerrar Sesión
Historia de Usuario:

Como ejecutivo comercial, quiero cerrar sesión de forma segura, para proteger mi información cuando uso dispositivos compartidos.

Criterios de Aceptación:
gherkinEscenario 1: Cerrar sesión exitosamente
  Dado que hago clic en "Cerrar sesión" desde el dropdown del header
  Entonces:
    - Se muestra modal de confirmación:
      * Título: "¿Cerrar sesión?"
      * Mensaje: "Serás redirigido a la página de login"
      * Botones: "Sí, cerrar sesión" y "Cancelar"
  Cuando hago clic en "Sí, cerrar sesión"
  Entonces:
    - Se invalida el token JWT del usuario
    - Se revoca el OAuth token de Google (llamada a Google API)
    - Se limpia el estado de Zustand (store.reset())
    - Se limpia el localStorage/sessionStorage
    - Soy redirigido a /login
    - Veo un toast: "Sesión cerrada correctamente"

Escenario 2: Cancelar cierre de sesión
  Dado que estoy en el modal de confirmación
  Cuando hago clic en "Cancelar"
  Entonces:
    - El modal se cierra
    - Permanezco en la vista actual
    - Mi sesión sigue activa

Escenario 3: Sesión expirada automáticamente
  Dado que mi token JWT expiró (después de 7 días de inactividad)
  Cuando intento hacer cualquier acción en la aplicación
  Entonces:
    - Veo un modal: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
    - Al hacer clic en "Aceptar", soy redirigido a /login
    - Se limpia todo el estado local
Requerimientos No Funcionales:

Seguridad: Implementar blacklist de tokens JWT revocados (usando Redis en backend)
UX: Animación de fade-out al cerrar sesión (300ms)


MODELO DE DATOS PRISMA (MVP)
```
prisma// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  picture         String?   // URL de foto de perfil de Google
  gmailApiKey     String?   // Encriptado en backend antes de guardar
  referenceDate   DateTime? // Fecha informativa para futuras funcionalidades
  lastImportAt    DateTime? // Última vez que importó emails
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  emails          Email[]
  tasks           Task[]
  comments        Comment[]
  importLogs      ImportLog[]
}

model Email {
  id              String    @id @default(cuid())
  userId          String
  gmailId         String    @unique // ID único del email en Gmail API
  senderId        String    // Email del remitente
  senderName      String    // Nombre del remitente
  subject         String
  body            String    @db.Text // Cuerpo completo del email (HTML)
  snippet         String    // Primeros 200 caracteres para preview
  category        String    // "Cliente" | "Lead" | "Interno"
  receivedAt      DateTime  // Fecha de recepción del email
  hasTask         Boolean   @default(false)
  createdAt       DateTime  @default(now())
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks           Task[]
  
  @@index([userId, category])
  @@index([userId, receivedAt])
  @@index([senderId])
}

model Task {
  id              String    @id @default(cuid())
  userId          String
  emailId         String
  title           String    // Título de la tarea (generado por IA)
  description     String    @db.Text // Descripción detallada de la tarea
  priority        String    // "Urgente" | "Alta" | "Media" | "Baja"
  status          String    @default("Pendiente") // "Pendiente" | "En Progreso" | "Completado"
  dueDate         DateTime? // Fecha límite estimada por IA
  aiConfidence    Int       // Confidence score de la IA (0-100)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  email           Email     @relation(fields: [emailId], references: [id], onDelete: Cascade)
  comments        Comment[]
  
  @@index([userId, status])
  @@index([userId, priority])
  @@index([emailId])
}

model Comment {
  id              String    @id @default(cuid())
  userId          String
  taskId          String
  content         String    @db.Text
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  task            Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@index([taskId])
}

model ImportLog {
  id              String    @id @default(cuid())
  userId          String
  emailsProcessed Int       // Cantidad de emails procesados
  emailsWithTasks Int       // Emails que tenían tareas
  tasksCreated    Int       // Total de tareas creadas
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  status          String    @default("processing") // "processing" | "completed" | "failed"
  errorMessage    String?   @db.Text
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, startedAt])
}
```

---

## **ARQUITECTURA Y FLUJOS TÉCNICOS**

### **Flujo de Autenticación OAuth**
```
┌─────────────────────────────────────────┐
│  Usuario hace clic en                   │
│  "Iniciar sesión con Google"            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Redirección a Google OAuth             │
│  Scopes: email, profile, gmail.readonly │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Usuario autoriza en página de Google   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Google redirige a /api/auth/callback   │
│  con authorization code                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Backend:                               │
│  1. Exchange code por access token      │
│  2. Obtener perfil del usuario (email,  │
│     name, picture)                      │
│  3. Buscar usuario en BD                │
└────────────┬────────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
    Existe    No existe
        │         │
        │         ▼
        │    ┌─────────────────────────┐
        │    │  Crear usuario en BD    │
        │    │  con datos de Google    │
        │    └────────┬────────────────┘
        │             │
        └─────────────┘
                  │
                  ▼
    ┌──────────────────────────────────┐
    │  Generar JWT token               │
    │  (expires: 7 días)               │
    └────────────┬─────────────────────┘
                 │
            ┌────┴────┐
            │         │
            ▼         ▼
    gmailApiKey   gmailApiKey
       NULL       != NULL
            │         │
            ▼         ▼
    /integracion  /dashboard
```

### **Flujo de Importación y Clasificación**
```
┌─────────────────────────────────────────┐
│  Usuario hace clic en                   │
│  "Importar Gmails"                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  POST /api/emails/import                │
│  Body: { userId }                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Backend:                               │
│  1. Validar gmailApiKey del usuario     │
│  2. Crear registro en ImportLog         │
│     (status: "processing")              │
│  3. Obtener lastImportAt del usuario    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Gmail API Request:                     │
│  GET /gmail/v1/users/me/messages        │
│  Params:                                │
│    - maxResults: 20                     │
│    - q: "after:{lastImportAt}"          │
│  Headers:                               │
│    - Authorization: Bearer {apiKey}     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Por cada email (paralelo, batch de 5): │
│                                         │
│  1. Extraer metadata:                   │
│     - gmailId                           │
│     - senderId, senderName              │
│     - subject, body, snippet            │
│     - receivedAt                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Llamar a Gemini API:                   │
│  POST /v1/models/gemini-pro:generateContent│
│  Body: {                                │
│    contents: [{ text: classificationPrompt }]│
│  }                                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Parsear respuesta JSON de Gemini:      │
│  {                                      │
│    category, priority,                  │
│    hasTask, tasks[], confidence         │
│  }                                      │
└────────────┬────────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
   category    category
   == "Spam"   != "Spam"
        │         │
        ▼         │
  Descartar       │
  (no guardar)    │
        │         │
        └─────────┘
                  │
                  ▼
    ┌──────────────────────────────────┐
    │  Guardar en BD:                  │
    │  1. Crear registro Email         │
    │  2. Si hasTask == true:          │
    │     - Crear registro(s) Task     │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  Actualizar progreso:            │
    │  - emailsProcessed++             │
    │  - Notificar al frontend vía     │
    │    polling o WebSocket           │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  Todos los emails procesados     │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  Finalizar:                      │
    │  1. Actualizar ImportLog:        │
    │     - status: "completed"        │
    │     - completedAt: now()         │
    │     - emailsWithTasks count      │
    │     - tasksCreated count         │
    │  2. Actualizar user.lastImportAt │
    │  3. Retornar resumen al frontend │
    └──────────────────────────────────┘

REQUERIMIENTOS NO FUNCIONALES GLOBALES
RNF-001: Seguridad

Autenticación: OAuth 2.0 con Google + JWT para sesiones
Encriptación: gmailApiKey encriptada con AES-256 en reposo
HTTPS: Obligatorio en producción (Vercel lo proporciona por defecto)
Sanitización: Limpiar HTML de emails con DOMPurify para prevenir XSS
Rate Limiting:

Importación: Máximo 1 request cada 5 minutos por usuario
APIs: 100 requests/minuto por usuario


CORS: Configurar origins permitidos solo para dominio de producción

RNF-002: Performance

Carga inicial: Dashboard <2 segundos (including data fetch)
Importación: <2 minutos para 20 emails (objetivo: ~90 segundos)
Búsqueda/Filtros: <100ms de respuesta
Drag & Drop: Feedback visual instantáneo (<50ms)
Optimización:

Índices en BD para queries frecuentes
Lazy loading de componentes pesados (React.lazy)
Virtualización de listas largas (react-window)
Caché de respuestas de IA (Redis) para emails similares



RNF-003: Escalabilidad (Para MVP)

Usuarios concurrentes: Soportar 50 usuarios simultáneos
Emails por usuario: Hasta 1000 emails sin degradación
Base de datos: PostgreSQL con NeonDB (plan gratuito soporta hasta 3GB)
Queue system: No implementar en MVP (procesar sincrónicamente)

RNF-004: Usabilidad

Accesibilidad:

Contraste WCAG 2.1 AA mínimo
Navegación por teclado funcional
Screen reader friendly (ARIA labels)


Responsive:

Desktop: 1280px+ (experiencia completa)
Tablet: 768px-1279px (Bandeja colapsable por defecto)
Mobile: 375px-767px (Bandeja como drawer, Kanban en scroll horizontal)


Loading states: Skeletons para todas las cargas asíncronas
Feedback visual: Toasts para acciones exitosas/errores
Idioma: Español únicamente (MVP)

RNF-005: Mantenibilidad

Logging:

Winston para logs estructurados
Niveles: info (operaciones normales), warn (API Key inválida), error (fallos críticos)
Logs persistentes en archivo (rotación diaria)


Monitoreo:

Vercel Analytics (incluido)
Sentry para tracking de errores (plan gratuito)


Testing (mínimo viable):

Unit tests para utils y helpers críticos
Integration tests para flujos de autenticación e importación
Sin E2E en MVP (agregar en v1.1)


Documentación:

README técnico con setup instructions
Comentarios en código para lógica compleja
Swagger/OpenAPI para documentar APIs (opcional)



RNF-006: Compatibilidad

Navegadores: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
Gmail API: v1 (stable)
Gemini API: Compatible con Vercel AI SDK v3.0+
Node.js: v18+ (requerido por Next.js 14)


NOTAS DEL ANALISTA: RIESGOS Y CONSIDERACIONES DEL MVP
🚨 Riesgos Críticos Identificados

Dependencia de Gmail API Key del usuario

Problema: Requiere que cada usuario cree su propio proyecto en Google Cloud, obtenga credenciales y las configure. Esto es una barrera significativa para usuarios no técnicos.
Impacto: Alta fricción en onboarding, posibles errores de configuración, abandono de usuarios.
Mitigación propuesta:

Corto plazo (MVP): Crear documentación visual paso a paso con capturas de pantalla para obtener la API Key.
Mediano plazo (v1.1): Centralizar la integración. La app tendría UN proyecto de Google Cloud y los usuarios solo autorizarían vía OAuth estándar (sin necesidad de traer su propia API Key).


Recomendación: Considera migrar a modelo centralizado post-MVP para mejorar UX.


Límite de 20 emails por importación

Problema: Si un usuario ejecutivo recibe 50-100 emails diarios (como indica el brief original), 20 emails es muy limitado.
Impacto: Usuarios deben importar manualmente 3-5 veces al día, lo cual es tedioso.
Mitigación propuesta:

MVP: Mantener límite de 20 pero permitir múltiples importaciones (quitar restricción de "1 cada 5 min").
v1.1: Implementar sincronización automática cada hora procesando hasta 50 emails.


Decisión: Validar con usuarios beta si 20 es suficiente o genera frustración.


Precisión de clasificación de IA

Riesgo: Gemini puede clasificar incorrectamente emails, crear tareas irrelevantes o no detectar tareas importantes.
Impacto: Pérdida de confianza del usuario, necesidad de corrección manual constante.
Mitigación:

Mostrar aiConfidence score en UI (aunque dijiste que no es necesario para MVP, considéralo como badge sutil).
Permitir feedback del usuario ("Esta clasificación fue incorrecta") para mejorar prompts en iteraciones futuras.
Testing exhaustivo con emails reales en español (modismos, fechas en formato latino, etc.).




Procesamiento síncrono de 20 emails

Problema: Si cada email toma 3-5 segundos (llamada a Gmail API + Gemini), 20 emails = 60-100 segundos. Esto bloquea al usuario.
Solución implementada: Procesamiento en paralelo (batches de 5 simultáneos).
Riesgo residual: Si Gemini API tiene latencia alta o rate limits, puede exceder los 2 minutos objetivo.
Contingencia: Mostrar progreso granular ("Procesando 15/20...") para mantener al usuario informado.


Seguridad de API Keys almacenadas

Riesgo: Si la BD se compromete, las API Keys encriptadas podrían ser descifradas.
Mitigación:

Encriptación AES-256 con clave maestra almacenada en variable de entorno (nunca en código).
- Encriptación AES-256 con clave maestra almacenada en variable de entorno (nunca en código).
     - Rotación periódica de la clave maestra (cada 90 días).
     - Auditoría de accesos a gmailApiKey (logging de cada desencriptación).
   - **Recomendación adicional**: Implementar OAuth refresh tokens en lugar de API Keys para v1.1.

6. **Emails con múltiples tareas: UX confusa**
   - **Problema**: Si un email genera 3 tareas, aparecen 3 cards separadas en el Kanban. El usuario puede no entender que están relacionadas.
   - **Solución actual**: Badge "🔗 Relacionadas" en cada card.
   - **Riesgo residual**: Usuario puede mover solo 1 de las 3 tareas a "Completado" pensando que finalizó todo.
   - **Mejora futura**: Agrupar tareas relacionadas en una card expandible o implementar subtareas checkbox.

---

### **🔗 Dependencias Entre Módulos**

- **RF-MVP-001 → RF-MVP-002**: La autenticación debe completarse antes de poder configurar la API Key.
- **RF-MVP-002 → RF-MVP-007**: La configuración de API Key es prerequisito para la importación de emails.
- **RF-MVP-007 → RF-MVP-008**: La importación depende de la clasificación con IA (no puede funcionar sin Gemini).
- **RF-MVP-003 ↔ RF-MVP-009**: Los filtros y la búsqueda modifican la vista principal del Kanban (bidireccional).
- **RF-MVP-004 ↔ RF-MVP-005**: Las cards del Kanban abren el panel lateral (interacción directa).
- **RF-MVP-011 → RF-MVP-007**: Si el usuario edita su API Key en Perfil, debe revalidarse antes de la próxima importación.

---

### **📋 Casos Límite Adicionales**

1. **Email sin remitente válido (campos vacíos en Gmail API)**
   - **Escenario**: Algunos emails automatizados pueden tener `from: null` o `from: noreply@system.com`.
   - **Solución**: Clasificar automáticamente como "Interno" y no crear tareas. Mostrar en Bandeja con placeholder "Remitente desconocido".

2. **Email en idioma diferente al español**
   - **Escenario**: Usuario recibe email en inglés: "Please send me the proposal by tomorrow".
   - **Solución**: Gemini es multilingüe. Debe clasificar correctamente en cualquier idioma.
   - **Prueba necesaria**: Validar con emails en inglés, portugués (común en LatAm) y spanglish.

3. **Emails muy largos (>10,000 caracteres)**
   - **Problema**: El token limit de Gemini puede alcanzarse.
   - **Solución**: Truncar `body` a 5000 caracteres antes de enviar a Gemini. Indicar en UI: "Email extenso, análisis basado en primeros párrafos".

4. **Usuario importa durante una importación en progreso**
   - **Escenario**: Usuario hace doble clic en "Importar Gmails" por impaciencia.
   - **Solución**: Deshabilitar botón mientras `ImportLog.status = "processing"`. Validar en backend que no exista importación activa.

5. **Filtros + Búsqueda + Drag & Drop simultáneos**
   - **Edge case**: Usuario filtra por "Cliente", busca "Carlos", arrastra una card a "Completado", pero la card desaparece de la vista porque ya no está en "Tareas".
   - **Solución**: Mostrar toast: "Tarea movida a Completado (oculta por filtros activos). Ver todas las tareas." con botón para limpiar filtros.

6. **Timezone de fechas en emails**
   - **Problema**: Email dice "mañana a las 3pm" pero fue enviado desde otra zona horaria.
   - **Solución**: Gmail API retorna fechas en UTC. Convertir a timezone del usuario (detectar desde navegador o permitir configurar en Perfil en v1.1).

7. **Gmail API quota exceeded**
   - **Escenario**: Google limita requests por día/minuto. Usuario supera el límite.
   - **Solución**: Capturar error 429 de Gmail API, mostrar mensaje: "Has alcanzado el límite de Gmail API por hoy. Intenta mañana." Loggear en `ImportLog.errorMessage`.

8. **Email con attachments muy pesados**
   - **Problema**: Gmail API puede tardar más en responder si el email tiene adjuntos de varios MB.
   - **Solución MVP**: Solo extraer metadata, NO descargar attachments. Indicar en UI si el email tiene attachments con ícono 📎 pero no mostrarlos.

---

### **🎯 Funcionalidades Excluidas del MVP (para roadmap futuro)**

Las siguientes funcionalidades fueron mencionadas en el proyecto completo pero NO están en el MVP:

#### **Excluidas confirmadas:**
- ❌ Relación inteligente de emails (detectar hilos de conversación)
- ❌ Gestión de clientes (tabla `clients` con información adicional)
- ❌ Múltiples subtareas checkbox por tarea
- ❌ Notificaciones push/email
- ❌ Sincronización automática (solo manual)
- ❌ Integración con Google Calendar
- ❌ Analytics dashboard (métricas de desempeño)
- ❌ Responder emails desde el Kanban
- ❌ Límite de procesamiento basado en fecha histórica (campo `referenceDate` es decorativo)
- ❌ Categorías personalizadas (solo predefinidas: Cliente/Lead/Interno)
- ❌ Reprocesar emails con IA (botón eliminado)
- ❌ Sistema de colas con BullMQ (procesamiento directo)

#### **Para considerar en v1.1:**
- ✅ Aumentar límite de emails procesables (50-100)
- ✅ Sincronización automática cada hora
- ✅ Notificaciones básicas (in-app)
- ✅ Gestión básica de clientes (tabla separada)
- ✅ Categorías custom
- ✅ Responder desde Kanban (composer embebido)

#### **Para considerar en v2.0:**
- ✅ Relación inteligente de emails con embeddings
- ✅ Multi-usuario/equipos
- ✅ Integración con CRM
- ✅ Analytics avanzados
- ✅ Mobile app nativa

---

### **💡 Recomendaciones de Implementación**

#### **1. Orden de desarrollo sugerido (6 sprints)**

**Sprint 1 (1.5 semanas): Fundación**
- Setup del proyecto: Next.js 14 + TypeScript + Prisma
- Configuración de PostgreSQL en NeonDB
- Autenticación OAuth con Google (RF-MVP-001)
- Modelo de datos Prisma inicial
- Vista de Login básica

**Sprint 2 (1.5 semanas): Configuración e Infraestructura**
- Vista de integración de API Key (RF-MVP-002)
- Encriptación de API Keys en backend
- Vista de Perfil (RF-MVP-011)
- Cierre de sesión (RF-MVP-012)
- Middleware de autenticación JWT

**Sprint 3 (2 semanas): IA y Procesamiento**
- Integración con Gmail API (RF-MVP-007 - parte 1)
- Integración con Gemini vía Vercel AI SDK (RF-MVP-008)
- Prompts de clasificación refinados
- Testing con emails reales en español
- Tabla `ImportLog` y sistema de progreso

**Sprint 4 (2 semanas): UI Principal - Kanban**
- Layout principal con header (RF-MVP-003)
- Componente de Bandeja lateral (RF-MVP-003)
- Cards de tareas en Kanban (RF-MVP-004)
- Drag & Drop entre columnas (RF-MVP-006)
- Estados de loading y placeholders

**Sprint 5 (1.5 semanas): Detalle y Comentarios**
- Panel lateral derecho (RF-MVP-005)
- Sistema de comentarios (crear/editar)
- Cambio de estado desde panel lateral
- Sanitización de HTML de emails
- Responsive design para tablet/móvil

**Sprint 6 (1.5 semanas): Filtros, Búsqueda y Polish**
- Filtros por categoría y prioridad (RF-MVP-009)
- Búsqueda global (RF-MVP-010)
- Refinamiento de UX (animaciones, toasts)
- Testing de integración completo
- Deploy a Vercel y configuración de dominios

**Total estimado: 10 semanas**

---

#### **2. Stack técnico detallado**
```json
// package.json (dependencias principales)
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.0.0",
    
    // UI Components
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.0",
    
    // State Management
    "zustand": "^4.4.0",
    
    // Forms & Validation
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    
    // AI & APIs
    "ai": "^3.0.0", // Vercel AI SDK
    "@google-cloud/gmail": "^4.0.0",
    "googleapis": "^128.0.0",
    
    // Auth
    "next-auth": "^5.0.0-beta",
    "jsonwebtoken": "^9.0.0",
    
    // Drag & Drop
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    
    // Utilities
    "date-fns": "^2.30.0",
    "dompurify": "^3.0.0",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

#### **3. Variables de entorno necesarias**
```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth (Autenticación)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Encriptación de API Keys
ENCRYPTION_KEY="your-aes-256-encryption-key-32-chars"

# Opcional: Sentry para error tracking
SENTRY_DSN="https://your-sentry-dsn.ingest.sentry.io/project-id"
```

---

#### **4. Estructura de carpetas propuesta**
email-to-kanban-mvp/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── integracion/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Vista principal (Kanban)
│   │   │   └── perfil/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── callback/route.ts
│   │   │   ├── emails/
│   │   │   │   ├── import/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts       # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PATCH (update), DELETE
│   │   │   └── comments/
│   │   │       └── route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # ShadCN components
│   │   ├── auth/
│   │   │   └── LoginButton.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── EmailBandeja.tsx
│   │   ├── panel/
│   │   │   └── DetailPanel.tsx
│   │   └── filters/
│   │       ├── SearchBar.tsx
│   │       └── FilterDropdowns.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── gmail.ts               # Gmail API wrapper
│   │   ├── gemini.ts              # Gemini classification logic
│   │   ├── encryption.ts          # AES encryption utilities
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useFilters.ts
│   ├── store/
│   │   └── useStore.ts            # Zustand global store
│   ├── types/
│   │   └── index.ts               # TypeScript types & interfaces
│   └── middleware.ts              # Auth middleware
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json

---

#### **5. Zustand Store Structure**
```typescript
// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Email {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  snippet: string;
  category: string;
  receivedAt: Date;
  hasTask: boolean;
}

interface Task {
  id: string;
  emailId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: Date;
}

interface Filters {
  category: string | null;
  priority: string | null;
  search: string;
}

interface Store {
  // State
  user: User | null;
  emails: Email[];
  tasks: Task[];
  filters: Filters;
  selectedTaskId: string | null;
  isImporting: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setEmails: (emails: Email[]) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSelectedTaskId: (id: string | null) => void;
  setIsImporting: (isImporting: boolean) => void;
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      emails: [],
      tasks: [],
      filters: { category: null, priority: null, search: '' },
      selectedTaskId: null,
      isImporting: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setEmails: (emails) => set({ emails }),
      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setIsImporting: (isImporting) => set({ isImporting }),
      reset: () =>
        set({
          user: null,
          emails: [],
          tasks: [],
          filters: { category: null, priority: null, search: '' },
          selectedTaskId: null,
          isImporting: false,
        }),
    }),
    {
      name: 'email-kanban-storage',
      partialize: (state) => ({ user: state.user }), // Solo persistir user
    }
  )
);
```

---

#### **6. Ejemplo de API Route: Importar Emails**
```typescript
// src/app/api/emails/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { fetchGmailMessages } from '@/lib/gmail';
import { classifyEmail } from '@/lib/gemini';
import { decryptApiKey } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Obtener usuario de BD
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.gmailApiKey) {
      return NextResponse.json(
        { error: 'Gmail API Key not configured' },
        { status: 400 }
      );
    }

    // 3. Validar si hay importación en progreso
    const activeImport = await prisma.importLog.findFirst({
      where: {
        userId: user.id,
        status: 'processing',
      },
    });

    if (activeImport) {
      return NextResponse.json(
        { error: 'Import already in progress' },
        { status: 409 }
      );
    }

    // 4. Crear log de importación
    const importLog = await prisma.importLog.create({
      data: {
        userId: user.id,
        emailsProcessed: 0,
        emailsWithTasks: 0,
        tasksCreated: 0,
        status: 'processing',
      },
    });

    // 5. Desencriptar API Key
    const apiKey = decryptApiKey(user.gmailApiKey);

    // 6. Obtener emails de Gmail
    const gmailMessages = await fetchGmailMessages({
      apiKey,
      maxResults: 20,
      after: user.lastImportAt,
    });

    if (gmailMessages.length === 0) {
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
      return NextResponse.json({
        message: 'No new emails to import',
        emailsProcessed: 0,
      });
    }

    // 7. Procesar emails en paralelo (batches de 5)
    const batchSize = 5;
    let emailsWithTasks = 0;
    let tasksCreated = 0;

    for (let i = 0; i < gmailMessages.length; i += batchSize) {
      const batch = gmailMessages.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (gmailMsg) => {
          try {
            // 7a. Clasificar con IA
            const classification = await classifyEmail({
              senderName: gmailMsg.from.name,
              senderEmail: gmailMsg.from.email,
              subject: gmailMsg.subject,
              body: gmailMsg.body,
              receivedAt: gmailMsg.date,
            });

            // 7b. Descartar spam
            if (classification.category === 'Spam') {
              return;
            }

            // 7c. Guardar email
            const email = await prisma.email.create({
              data: {
                userId: user.id,
                gmailId: gmailMsg.id,
                senderId: gmailMsg.from.email,
                senderName: gmailMsg.from.name,
                subject: gmailMsg.subject,
                body: gmailMsg.body,
                snippet: gmailMsg.snippet,
                category: classification.category,
                receivedAt: gmailMsg.date,
                hasTask: classification.hasTask,
              },
            });

            // 7d. Crear tareas si existen
            if (classification.hasTask && classification.tasks) {
              await prisma.task.createMany({
                data: classification.tasks.map((task) => ({
                  userId: user.id,
                  emailId: email.id,
                  title: `${task.description.substring(0, 50)} - ${gmailMsg.from.name}`,
                  description: task.description,
                  priority: task.priority,
                  status: 'Pendiente',
                  dueDate: task.dueDate,
                  aiConfidence: classification.confidence,
                })),
              });

              emailsWithTasks++;
              tasksCreated += classification.tasks.length;
            }
          } catch (error) {
            console.error('Error processing email:', error);
            // Continuar con siguiente email
          }
        })
      );

      // 7e. Actualizar progreso
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          emailsProcessed: i + batch.length,
        },
      });
    }

    // 8. Finalizar importación
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        emailsWithTasks,
        tasksCreated,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastImportAt: new Date() },
    });

    // 9. Retornar resumen
    return NextResponse.json({
      message: 'Import completed successfully',
      emailsProcessed: gmailMessages.length,
      emailsWithTasks,
      tasksCreated,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## **CRITERIOS DE ACEPTACIÓN DEL MVP**

### **Definición de "Hecho" (Definition of Done)**

El MVP se considera completo cuando cumple TODOS estos criterios:

#### **Funcionalidad Core**
- ✅ Usuario puede autenticarse con Google OAuth
- ✅ Usuario puede configurar su Gmail API Key
- ✅ Usuario puede importar 20 emails manualmente
- ✅ IA clasifica emails con precisión ≥70% (validado con 100 emails reales)
- ✅ Emails clasificados aparecen en Bandeja lateral
- ✅ Tareas detectadas se muestran como cards en Kanban
- ✅ Usuario puede arrastrar cards entre columnas (Drag & Drop funcional)
- ✅ Usuario puede ver detalle completo de email en panel lateral
- ✅ Usuario puede agregar y editar comentarios en tareas
- ✅ Usuario puede filtrar por categoría y prioridad
- ✅ Usuario puede buscar por remitente o asunto
- ✅ Usuario puede editar su Gmail API Key desde Perfil
- ✅ Usuario puede cerrar sesión de forma segura

#### **Calidad y Performance**
- ✅ Dashboard carga en <2 segundos
- ✅ Importación de 20 emails completa en <2 minutos
- ✅ No hay errores en consola del navegador
- ✅ No hay memory leaks en componentes React
- ✅ Responsive funcional en desktop (1280px+) y mobile (375px+)

#### **Seguridad**
- ✅ Gmail API Keys almacenadas encriptadas (AES-256)
- ✅ OAuth tokens manejados de forma segura (httpOnly cookies)
- ✅ HTML de emails sanitizado (prevención de XSS)
- ✅ HTTPS habilitado en producción

#### **Deploy y Documentación**
- ✅ Aplicación deployada en Vercel
- ✅ Base de datos PostgreSQL funcional en NeonDB
- ✅ Variables de entorno configuradas correctamente
- ✅ README con instrucciones de setup para desarrollo
- ✅ Documentación básica de cómo obtener Gmail API Key

---

## **RESUMEN EJECUTIVO DEL MVP**

### **Alcance Simplificado**
- **12 Requerimientos Funcionales** (vs 10 en proyecto completo)
- **6 Requerimientos No Funcionales**
- **5 módulos** interconectados
- **Tiempo estimado**: 10 semanas
- **Stack validado**: Next.js 14 + Prisma + Gemini + Gmail API + Vercel

### **Diferencias Clave vs Proyecto Completo**
| Característica | Proyecto Completo | MVP |
|----------------|-------------------|-----|
| Sincronización | Automática + Manual | Solo Manual |
| Límite de emails | Sin límite | 20 por importación |
| Relación de emails | Inteligente con embeddings | No implementado |
| Gestión de clientes | Tabla dedicada con info completa | No implementado |
| Categorías | Predefinidas + Custom | Solo predefinidas |
| Notificaciones | Sí | No |
| Analytics | Dashboard completo | No |
| Subtareas | Checkbox list | No (solo descripción) |

### **Prioridades de Implementación**
1. **Crítico (Bloqueante)**: RF-MVP-001 a RF-MVP-008
2. **Alto**: RF-MVP-003 a RF-MVP-006
3. **Medio**: RF-MVP-009, RF-MVP-010
4. **Bajo**: RF-MVP-011, RF-MVP-012

### **Riesgos Principales** (ya documentados arriba)
1. Fricción en onboarding por configuración de API Key
2. Límite de 20 emails puede ser insuficiente
3. Precisión de IA <80% requiere refinamiento de prompts

---

**¿Necesitas que genere algo adicional antes de comenzar la implementación?** Por ejemplo:

1. **Documento Markdown completo** con toda esta especificación (descargable)
2. **Diagrama de base de datos** visual (Mermaid)
3. **User Stories en formato Jira/Linear** (para gestión de proyecto)
4. **Guía paso a paso** de cómo obtener Gmail API Key (para usuarios finales)
5. **Scripts de Prisma** para seed de datos de prueba
6. **Prompts refinados para Gemini** con más ejemplos edge case

De lo contrario, **¡tienes todo listo para comenzar a construir el MVP!** 🚀 Cuando necesites refinar algún requerimiento específico o resolver conflictos durante la implementación, estaré aquí para asistirte.- Encriptación AES-256 con clave maestra almacenada en variable de entorno (nunca en código).
     - Rotación periódica de la clave maestra (cada 90 días).
     - Auditoría de accesos a gmailApiKey (logging de cada desencriptación).
   - **Recomendación adicional**: Implementar OAuth refresh tokens en lugar de API Keys para v1.1.

6. **Emails con múltiples tareas: UX confusa**
   - **Problema**: Si un email genera 3 tareas, aparecen 3 cards separadas en el Kanban. El usuario puede no entender que están relacionadas.
   - **Solución actual**: Badge "🔗 Relacionadas" en cada card.
   - **Riesgo residual**: Usuario puede mover solo 1 de las 3 tareas a "Completado" pensando que finalizó todo.
   - **Mejora futura**: Agrupar tareas relacionadas en una card expandible o implementar subtareas checkbox.

---

### **🔗 Dependencias Entre Módulos**

- **RF-MVP-001 → RF-MVP-002**: La autenticación debe completarse antes de poder configurar la API Key.
- **RF-MVP-002 → RF-MVP-007**: La configuración de API Key es prerequisito para la importación de emails.
- **RF-MVP-007 → RF-MVP-008**: La importación depende de la clasificación con IA (no puede funcionar sin Gemini).
- **RF-MVP-003 ↔ RF-MVP-009**: Los filtros y la búsqueda modifican la vista principal del Kanban (bidireccional).
- **RF-MVP-004 ↔ RF-MVP-005**: Las cards del Kanban abren el panel lateral (interacción directa).
- **RF-MVP-011 → RF-MVP-007**: Si el usuario edita su API Key en Perfil, debe revalidarse antes de la próxima importación.

---

### **📋 Casos Límite Adicionales**

1. **Email sin remitente válido (campos vacíos en Gmail API)**
   - **Escenario**: Algunos emails automatizados pueden tener `from: null` o `from: noreply@system.com`.
   - **Solución**: Clasificar automáticamente como "Interno" y no crear tareas. Mostrar en Bandeja con placeholder "Remitente desconocido".

2. **Email en idioma diferente al español**
   - **Escenario**: Usuario recibe email en inglés: "Please send me the proposal by tomorrow".
   - **Solución**: Gemini es multilingüe. Debe clasificar correctamente en cualquier idioma.
   - **Prueba necesaria**: Validar con emails en inglés, portugués (común en LatAm) y spanglish.

3. **Emails muy largos (>10,000 caracteres)**
   - **Problema**: El token limit de Gemini puede alcanzarse.
   - **Solución**: Truncar `body` a 5000 caracteres antes de enviar a Gemini. Indicar en UI: "Email extenso, análisis basado en primeros párrafos".

4. **Usuario importa durante una importación en progreso**
   - **Escenario**: Usuario hace doble clic en "Importar Gmails" por impaciencia.
   - **Solución**: Deshabilitar botón mientras `ImportLog.status = "processing"`. Validar en backend que no exista importación activa.

5. **Filtros + Búsqueda + Drag & Drop simultáneos**
   - **Edge case**: Usuario filtra por "Cliente", busca "Carlos", arrastra una card a "Completado", pero la card desaparece de la vista porque ya no está en "Tareas".
   - **Solución**: Mostrar toast: "Tarea movida a Completado (oculta por filtros activos). Ver todas las tareas." con botón para limpiar filtros.

6. **Timezone de fechas en emails**
   - **Problema**: Email dice "mañana a las 3pm" pero fue enviado desde otra zona horaria.
   - **Solución**: Gmail API retorna fechas en UTC. Convertir a timezone del usuario (detectar desde navegador o permitir configurar en Perfil en v1.1).

7. **Gmail API quota exceeded**
   - **Escenario**: Google limita requests por día/minuto. Usuario supera el límite.
   - **Solución**: Capturar error 429 de Gmail API, mostrar mensaje: "Has alcanzado el límite de Gmail API por hoy. Intenta mañana." Loggear en `ImportLog.errorMessage`.

8. **Email con attachments muy pesados**
   - **Problema**: Gmail API puede tardar más en responder si el email tiene adjuntos de varios MB.
   - **Solución MVP**: Solo extraer metadata, NO descargar attachments. Indicar en UI si el email tiene attachments con ícono 📎 pero no mostrarlos.

---

### **🎯 Funcionalidades Excluidas del MVP (para roadmap futuro)**

Las siguientes funcionalidades fueron mencionadas en el proyecto completo pero NO están en el MVP:

#### **Excluidas confirmadas:**
- ❌ Relación inteligente de emails (detectar hilos de conversación)
- ❌ Gestión de clientes (tabla `clients` con información adicional)
- ❌ Múltiples subtareas checkbox por tarea
- ❌ Notificaciones push/email
- ❌ Sincronización automática (solo manual)
- ❌ Integración con Google Calendar
- ❌ Analytics dashboard (métricas de desempeño)
- ❌ Responder emails desde el Kanban
- ❌ Límite de procesamiento basado en fecha histórica (campo `referenceDate` es decorativo)
- ❌ Categorías personalizadas (solo predefinidas: Cliente/Lead/Interno)
- ❌ Reprocesar emails con IA (botón eliminado)
- ❌ Sistema de colas con BullMQ (procesamiento directo)

#### **Para considerar en v1.1:**
- ✅ Aumentar límite de emails procesables (50-100)
- ✅ Sincronización automática cada hora
- ✅ Notificaciones básicas (in-app)
- ✅ Gestión básica de clientes (tabla separada)
- ✅ Categorías custom
- ✅ Responder desde Kanban (composer embebido)

#### **Para considerar en v2.0:**
- ✅ Relación inteligente de emails con embeddings
- ✅ Multi-usuario/equipos
- ✅ Integración con CRM
- ✅ Analytics avanzados
- ✅ Mobile app nativa

---

### **💡 Recomendaciones de Implementación**

#### **1. Orden de desarrollo sugerido (6 sprints)**

**Sprint 1 (1.5 semanas): Fundación**
- Setup del proyecto: Next.js 14 + TypeScript + Prisma
- Configuración de PostgreSQL en NeonDB
- Autenticación OAuth con Google (RF-MVP-001)
- Modelo de datos Prisma inicial
- Vista de Login básica

**Sprint 2 (1.5 semanas): Configuración e Infraestructura**
- Vista de integración de API Key (RF-MVP-002)
- Encriptación de API Keys en backend
- Vista de Perfil (RF-MVP-011)
- Cierre de sesión (RF-MVP-012)
- Middleware de autenticación JWT

**Sprint 3 (2 semanas): IA y Procesamiento**
- Integración con Gmail API (RF-MVP-007 - parte 1)
- Integración con Gemini vía Vercel AI SDK (RF-MVP-008)
- Prompts de clasificación refinados
- Testing con emails reales en español
- Tabla `ImportLog` y sistema de progreso

**Sprint 4 (2 semanas): UI Principal - Kanban**
- Layout principal con header (RF-MVP-003)
- Componente de Bandeja lateral (RF-MVP-003)
- Cards de tareas en Kanban (RF-MVP-004)
- Drag & Drop entre columnas (RF-MVP-006)
- Estados de loading y placeholders

**Sprint 5 (1.5 semanas): Detalle y Comentarios**
- Panel lateral derecho (RF-MVP-005)
- Sistema de comentarios (crear/editar)
- Cambio de estado desde panel lateral
- Sanitización de HTML de emails
- Responsive design para tablet/móvil

**Sprint 6 (1.5 semanas): Filtros, Búsqueda y Polish**
- Filtros por categoría y prioridad (RF-MVP-009)
- Búsqueda global (RF-MVP-010)
- Refinamiento de UX (animaciones, toasts)
- Testing de integración completo
- Deploy a Vercel y configuración de dominios

**Total estimado: 10 semanas**

---

#### **2. Stack técnico detallado**
```json
// package.json (dependencias principales)
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.0.0",
    
    // UI Components
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.0",
    
    // State Management
    "zustand": "^4.4.0",
    
    // Forms & Validation
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    
    // AI & APIs
    "ai": "^3.0.0", // Vercel AI SDK
    "@google-cloud/gmail": "^4.0.0",
    "googleapis": "^128.0.0",
    
    // Auth
    "next-auth": "^5.0.0-beta",
    "jsonwebtoken": "^9.0.0",
    
    // Drag & Drop
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    
    // Utilities
    "date-fns": "^2.30.0",
    "dompurify": "^3.0.0",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

#### **3. Variables de entorno necesarias**
```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth (Autenticación)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Encriptación de API Keys
ENCRYPTION_KEY="your-aes-256-encryption-key-32-chars"

# Opcional: Sentry para error tracking
SENTRY_DSN="https://your-sentry-dsn.ingest.sentry.io/project-id"
```

---

#### **4. Estructura de carpetas propuesta**
email-to-kanban-mvp/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── integracion/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Vista principal (Kanban)
│   │   │   └── perfil/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── callback/route.ts
│   │   │   ├── emails/
│   │   │   │   ├── import/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts       # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PATCH (update), DELETE
│   │   │   └── comments/
│   │   │       └── route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # ShadCN components
│   │   ├── auth/
│   │   │   └── LoginButton.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── EmailBandeja.tsx
│   │   ├── panel/
│   │   │   └── DetailPanel.tsx
│   │   └── filters/
│   │       ├── SearchBar.tsx
│   │       └── FilterDropdowns.tsx
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── gmail.ts               # Gmail API wrapper
│   │   ├── gemini.ts              # Gemini classification logic
│   │   ├── encryption.ts          # AES encryption utilities
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useFilters.ts
│   ├── store/
│   │   └── useStore.ts            # Zustand global store
│   ├── types/
│   │   └── index.ts               # TypeScript types & interfaces
│   └── middleware.ts              # Auth middleware
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json

---

#### **5. Zustand Store Structure**
```typescript
// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Email {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  snippet: string;
  category: string;
  receivedAt: Date;
  hasTask: boolean;
}

interface Task {
  id: string;
  emailId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: Date;
}

interface Filters {
  category: string | null;
  priority: string | null;
  search: string;
}

interface Store {
  // State
  user: User | null;
  emails: Email[];
  tasks: Task[];
  filters: Filters;
  selectedTaskId: string | null;
  isImporting: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setEmails: (emails: Email[]) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSelectedTaskId: (id: string | null) => void;
  setIsImporting: (isImporting: boolean) => void;
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      emails: [],
      tasks: [],
      filters: { category: null, priority: null, search: '' },
      selectedTaskId: null,
      isImporting: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setEmails: (emails) => set({ emails }),
      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setIsImporting: (isImporting) => set({ isImporting }),
      reset: () =>
        set({
          user: null,
          emails: [],
          tasks: [],
          filters: { category: null, priority: null, search: '' },
          selectedTaskId: null,
          isImporting: false,
        }),
    }),
    {
      name: 'email-kanban-storage',
      partialize: (state) => ({ user: state.user }), // Solo persistir user
    }
  )
);
```

---

#### **6. Ejemplo de API Route: Importar Emails**
```typescript
// src/app/api/emails/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { fetchGmailMessages } from '@/lib/gmail';
import { classifyEmail } from '@/lib/gemini';
import { decryptApiKey } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Obtener usuario de BD
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.gmailApiKey) {
      return NextResponse.json(
        { error: 'Gmail API Key not configured' },
        { status: 400 }
      );
    }

    // 3. Validar si hay importación en progreso
    const activeImport = await prisma.importLog.findFirst({
      where: {
        userId: user.id,
        status: 'processing',
      },
    });

    if (activeImport) {
      return NextResponse.json(
        { error: 'Import already in progress' },
        { status: 409 }
      );
    }

    // 4. Crear log de importación
    const importLog = await prisma.importLog.create({
      data: {
        userId: user.id,
        emailsProcessed: 0,
        emailsWithTasks: 0,
        tasksCreated: 0,
        status: 'processing',
      },
    });

    // 5. Desencriptar API Key
    const apiKey = decryptApiKey(user.gmailApiKey);

    // 6. Obtener emails de Gmail
    const gmailMessages = await fetchGmailMessages({
      apiKey,
      maxResults: 20,
      after: user.lastImportAt,
    });

    if (gmailMessages.length === 0) {
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
      return NextResponse.json({
        message: 'No new emails to import',
        emailsProcessed: 0,
      });
    }

    // 7. Procesar emails en paralelo (batches de 5)
    const batchSize = 5;
    let emailsWithTasks = 0;
    let tasksCreated = 0;

    for (let i = 0; i < gmailMessages.length; i += batchSize) {
      const batch = gmailMessages.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (gmailMsg) => {
          try {
            // 7a. Clasificar con IA
            const classification = await classifyEmail({
              senderName: gmailMsg.from.name,
              senderEmail: gmailMsg.from.email,
              subject: gmailMsg.subject,
              body: gmailMsg.body,
              receivedAt: gmailMsg.date,
            });

            // 7b. Descartar spam
            if (classification.category === 'Spam') {
              return;
            }

            // 7c. Guardar email
            const email = await prisma.email.create({
              data: {
                userId: user.id,
                gmailId: gmailMsg.id,
                senderId: gmailMsg.from.email,
                senderName: gmailMsg.from.name,
                subject: gmailMsg.subject,
                body: gmailMsg.body,
                snippet: gmailMsg.snippet,
                category: classification.category,
                receivedAt: gmailMsg.date,
                hasTask: classification.hasTask,
              },
            });

            // 7d. Crear tareas si existen
            if (classification.hasTask && classification.tasks) {
              await prisma.task.createMany({
                data: classification.tasks.map((task) => ({
                  userId: user.id,
                  emailId: email.id,
                  title: `${task.description.substring(0, 50)} - ${gmailMsg.from.name}`,
                  description: task.description,
                  priority: task.priority,
                  status: 'Pendiente',
                  dueDate: task.dueDate,
                  aiConfidence: classification.confidence,
                })),
              });

              emailsWithTasks++;
              tasksCreated += classification.tasks.length;
            }
          } catch (error) {
            console.error('Error processing email:', error);
            // Continuar con siguiente email
          }
        })
      );

      // 7e. Actualizar progreso
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          emailsProcessed: i + batch.length,
        },
      });
    }

    // 8. Finalizar importación
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        emailsWithTasks,
        tasksCreated,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastImportAt: new Date() },
    });

    // 9. Retornar resumen
    return NextResponse.json({
      message: 'Import completed successfully',
      emailsProcessed: gmailMessages.length,
      emailsWithTasks,
      tasksCreated,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## **CRITERIOS DE ACEPTACIÓN DEL MVP**

### **Definición de "Hecho" (Definition of Done)**

El MVP se considera completo cuando cumple TODOS estos criterios:

#### **Funcionalidad Core**
- ✅ Usuario puede autenticarse con Google OAuth
- ✅ Usuario puede configurar su Gmail API Key
- ✅ Usuario puede importar 20 emails manualmente
- ✅ IA clasifica emails con precisión ≥70% (validado con 100 emails reales)
- ✅ Emails clasificados aparecen en Bandeja lateral
- ✅ Tareas detectadas se muestran como cards en Kanban
- ✅ Usuario puede arrastrar cards entre columnas (Drag & Drop funcional)
- ✅ Usuario puede ver detalle completo de email en panel lateral
- ✅ Usuario puede agregar y editar comentarios en tareas
- ✅ Usuario puede filtrar por categoría y prioridad
- ✅ Usuario puede buscar por remitente o asunto
- ✅ Usuario puede editar su Gmail API Key desde Perfil
- ✅ Usuario puede cerrar sesión de forma segura

#### **Calidad y Performance**
- ✅ Dashboard carga en <2 segundos
- ✅ Importación de 20 emails completa en <2 minutos
- ✅ No hay errores en consola del navegador
- ✅ No hay memory leaks en componentes React
- ✅ Responsive funcional en desktop (1280px+) y mobile (375px+)

#### **Seguridad**
- ✅ Gmail API Keys almacenadas encriptadas (AES-256)
- ✅ OAuth tokens manejados de forma segura (httpOnly cookies)
- ✅ HTML de emails sanitizado (prevención de XSS)
- ✅ HTTPS habilitado en producción

#### **Deploy y Documentación**
- ✅ Aplicación deployada en Vercel
- ✅ Base de datos PostgreSQL funcional en NeonDB
- ✅ Variables de entorno configuradas correctamente
- ✅ README con instrucciones de setup para desarrollo
- ✅ Documentación básica de cómo obtener Gmail API Key

---

## **RESUMEN EJECUTIVO DEL MVP**

### **Alcance Simplificado**
- **12 Requerimientos Funcionales** (vs 10 en proyecto completo)
- **6 Requerimientos No Funcionales**
- **5 módulos** interconectados
- **Tiempo estimado**: 10 semanas
- **Stack validado**: Next.js 14 + Prisma + Gemini + Gmail API + Vercel

### **Diferencias Clave vs Proyecto Completo**
| Característica | Proyecto Completo | MVP |
|----------------|-------------------|-----|
| Sincronización | Automática + Manual | Solo Manual |
| Límite de emails | Sin límite | 20 por importación |
| Relación de emails | Inteligente con embeddings | No implementado |
| Gestión de clientes | Tabla dedicada con info completa | No implementado |
| Categorías | Predefinidas + Custom | Solo predefinidas |
| Notificaciones | Sí | No |
| Analytics | Dashboard completo | No |
| Subtareas | Checkbox list | No (solo descripción) |

### **Prioridades de Implementación**
1. **Crítico (Bloqueante)**: RF-MVP-001 a RF-MVP-008
2. **Alto**: RF-MVP-003 a RF-MVP-006
3. **Medio**: RF-MVP-009, RF-MVP-010
4. **Bajo**: RF-MVP-011, RF-MVP-012

### **Riesgos Principales** (ya documentados arriba)
1. Fricción en onboarding por configuración de API Key
2. Límite de 20 emails puede ser insuficiente
3. Precisión de IA <80% requiere refinamiento de prompts

---

**¿Necesitas que genere algo adicional antes de comenzar la implementación?** Por ejemplo:

1. **Documento Markdown completo** con toda esta especificación (descargable)
2. **Diagrama de base de datos** visual (Mermaid)
3. **User Stories en formato Jira/Linear** (para gestión de proyecto)
4. **Guía paso a paso** de cómo obtener Gmail API Key (para usuarios finales)
5. **Scripts de Prisma** para seed de datos de prueba
6. **Prompts refinados para Gemini** con más ejemplos edge case

De lo contrario, **¡tienes todo listo para comenzar a construir el MVP!** 🚀 Cuando necesites refinar algún requerimiento específico o resolver conflictos durante la implementación, estaré aquí para asistirte.