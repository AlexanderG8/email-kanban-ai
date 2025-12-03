# Email Kanban AI

> Sistema inteligente de gestión de emails con IA que transforma tu bandeja de entrada en un tablero Kanban productivo.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## Descripción

**Email Kanban AI** es una aplicación web empresarial que revoluciona la gestión de correos electrónicos mediante inteligencia artificial. Conecta tu cuenta de Gmail, sincroniza tus emails y permite que la IA de Google Gemini los clasifique automáticamente, extraiga tareas y las organice en un tablero Kanban visual e interactivo.


### Características Principales

#### Autenticación Segura
- Inicio de sesión con Google OAuth 2.0
- Gestión de sesiones con JWT
- Tokens de actualización automática
- Protección de rutas con middleware

#### Integración Gmail
- Sincronización automática de emails desde Gmail
- Conexión segura mediante Gmail API
- Rate limiting para optimizar recursos
- Encriptación AES-256-GCM de credenciales

#### Clasificación con IA
- **Clasificación inteligente** de emails en: Cliente, Lead, Interno o Spam
- **Extracción automática** de tareas desde el contenido del email
- **Asignación de prioridades**: Urgente, Alta, Media, Baja
- **Inferencia de fechas** de vencimiento del contexto
- **Nivel de confianza** IA (0-100%) para cada clasificación

#### Tablero Kanban Interactivo
- Tres columnas de estado: **Pendiente**, **En Progreso**, **Completado**
- Drag & Drop fluido con dnd-kit
- Filtros avanzados por categoría, prioridad y búsqueda
- Tarjetas de tareas con información detallada
- Contador de tareas por columna
- Interfaz responsive y moderna

#### Panel de Detalles
- Vista completa de cada tarea
- Información del email relacionado
- Sistema de comentarios con edición
- Edición inline de estado y fechas
- Historial de cambios

#### Dashboard de Análisis
- **KPIs principales**: Tareas activas, tasa de completación, emails recibidos
- **Gráficos estratégicos**:
  - Distribución de tareas por estado
  - Tareas por prioridad
  - Timeline de completación (30 días)
  - Emails por categoría
  - Heatmap de productividad (día/hora)
- **Top 10 remitentes** con estadísticas
- **Tareas próximas a vencer**

#### Vista de Emails Procesados
- Tabla paginada con todos los emails
- Filtros por categoría y rango de fechas
- Búsqueda por remitente o asunto
- Modal de detalle completo
- Indicador de tareas relacionadas

#### Perfil de Usuario
- Información personal de Google
- Contador de tokens IA utilizados
- Configuración de Gmail API
- Historial de sincronizaciones

---

## Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.0.2 | Framework React con App Router |
| React | 19.2.0 | Biblioteca de UI |
| TypeScript | 5.0 | Tipado estático |
| TailwindCSS | 4.0 | Estilos y diseño |
| Zustand | 5.0.8 | Gestión de estado global |
| dnd-kit | 6.3.1 | Drag & Drop |
| Recharts | 3.5.0 | Gráficos y visualizaciones |
| Radix UI | - | Componentes UI accesibles |
| Zod | 4.1.12 | Validación de esquemas |
| date-fns | 4.1.0 | Manipulación de fechas |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js API Routes | 16.0.2 | Endpoints RESTful serverless |
| PostgreSQL | - | Base de datos relacional |
| Prisma | 6.19.0 | ORM y migraciones |
| NextAuth.js | 5.0.0-beta.30 | Autenticación |
| Gmail API | - | Integración con Gmail |
| Google OAuth | - | Proveedor de autenticación |

### Inteligencia Artificial
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Vercel AI SDK | 5.0.97 | Framework de IA |
| Google Gemini | 2.0.39 | Modelo de lenguaje LLM |

### Seguridad
| Tecnología | Propósito |
|------------|-----------|
| AES-256-GCM | Encriptación de API keys |
| JWT | Tokens de sesión |
| DOMPurify | Sanitización de HTML |
| PBKDF2 | Derivación de claves |

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 20.x o superior
- **npm** o **yarn** o **pnpm**
- **PostgreSQL** 14.x o superior (o cuenta en [Neon](https://neon.tech/))
- **Cuenta de Google Cloud Platform** con Gmail API habilitada
- **API Key de Google Gemini** ([obtener aquí](https://ai.google.dev/))

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/email-kanban-ai.git
cd email-kanban-ai
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Poblar con datos de prueba
npm run db:seed
```

---

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database?sslmode=require"

# NextAuth - Autenticación
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-base64-32-bytes"
AUTH_SECRET="tu-secret-base64-32-bytes"

# Google OAuth
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-tu-client-secret"

# Gemini AI
GEMINI_API_KEY="AIzaSy-tu-api-key"

# Encriptación de API Keys (64 caracteres hexadecimales)
ENCRYPTION_KEY="tu-encryption-key-hex-64-chars"

# Opcional: Sentry para monitoreo de errores
SENTRY_DSN="https://tu-sentry-dsn.ingest.sentry.io/project-id"
```

### Configuración de Google Cloud Platform

1. **Crear un proyecto** en [Google Cloud Console](https://console.cloud.google.com/)

2. **Habilitar APIs**:
   - Gmail API
   - Google OAuth 2.0

3. **Crear credenciales OAuth 2.0**:
   - Tipo: Aplicación web
   - URIs de redirección autorizados:
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://tu-dominio.com/api/auth/callback/google` (producción)
   - Alcances necesarios:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/gmail.readonly`

4. **Copiar** el Client ID y Client Secret al archivo `.env`

### Generar Claves de Encriptación

```bash
# NEXTAUTH_SECRET y AUTH_SECRET (32 bytes en base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# ENCRYPTION_KEY (32 bytes en hexadecimal = 64 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Uso

### Desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

```bash
# Construir la aplicación
npm run build

# Iniciar el servidor de producción
npm start
```

### Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint para verificar el código |
| `npm run db:seed` | Poblar la base de datos con datos de prueba |
| `npm run db:clean` | Limpiar usuarios de la base de datos |

---

## Estructura del Proyecto

```
email-kanban-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login/                # Página de inicio de sesión
│   │   └── integracion/          # Configuración de Gmail
│   ├── dashboard/                # Tablero Kanban principal
│   ├── analisis/                 # Dashboard de análisis
│   ├── emailsprocesados/         # Vista de emails procesados
│   └── api/                      # API Routes
│       ├── auth/                 # NextAuth endpoints
│       ├── emails/               # Gestión de emails
│       ├── tasks/                # CRUD de tareas
│       ├── comments/             # CRUD de comentarios
│       ├── analytics/            # Endpoints de análisis
│       └── user/                 # Configuración de usuario
│
├── components/                   # Componentes React
│   ├── auth/                     # Componentes de autenticación
│   ├── kanban/                   # Tablero Kanban
│   ├── emails/                   # Tabla de emails
│   ├── analytics/                # Gráficos y métricas
│   ├── panel/                    # Panel de detalles
│   ├── layout/                   # Header y navegación
│   └── ui/                       # Componentes UI base (ShadCN)
│
├── lib/                          # Utilidades y funciones
│   ├── prisma.ts                 # Cliente de Prisma
│   ├── gemini.ts                 # Integración con Gemini IA
│   ├── gmail-api.ts              # Integración con Gmail API
│   ├── encryption.ts             # Funciones de encriptación
│   └── utils.ts                  # Utilidades generales
│
├── store/                        # Gestión de estado
│   └── useStore.ts               # Store global con Zustand
│
├── types/                        # Definiciones de TypeScript
│   ├── analytics.ts              # Tipos de análisis
│   ├── emails.ts                 # Tipos de emails
│   └── next-auth.d.ts            # Extensiones de NextAuth
│
├── prisma/                       # Configuración de base de datos
│   ├── schema.prisma             # Esquema de la BD
│   ├── migrations/               # Migraciones
│   └── seed.ts                   # Datos de prueba
│
├── public/                       # Archivos estáticos
├── documentation/                # Documentación del proyecto
├── auth.ts                       # Configuración de NextAuth
├── middleware.ts                 # Middleware de protección
└── package.json                  # Dependencias y scripts
```

---

## API Endpoints

### Autenticación
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes (login, callback, etc.)

### Emails
- `POST /api/emails/import` - Sincronizar emails desde Gmail
- `GET /api/emails` - Obtener todos los emails del usuario
- `GET /api/emails/processed` - Obtener emails con filtros y paginación

### Tareas
- `GET /api/tasks` - Obtener todas las tareas del usuario
- `POST /api/tasks` - Crear una nueva tarea
- `PUT /api/tasks/[id]` - Actualizar tarea existente
- `DELETE /api/tasks/[id]` - Eliminar tarea

### Comentarios
- `GET /api/comments` - Obtener comentarios de una tarea
- `POST /api/comments` - Crear nuevo comentario
- `PUT /api/comments/[id]` - Actualizar comentario
- `DELETE /api/comments/[id]` - Eliminar comentario

### Analytics
- `GET /api/analytics/overview` - Métricas principales (KPIs)
- `GET /api/analytics/tasks-distribution` - Distribución por estado
- `GET /api/analytics/timeline` - Timeline de completación (30 días)
- `GET /api/analytics/emails-category` - Emails por categoría
- `GET /api/analytics/top-senders` - Top 10 remitentes
- `GET /api/analytics/productivity-heatmap` - Heatmap de productividad
- `GET /api/analytics/upcoming-tasks` - Tareas próximas a vencer

### Usuario
- `GET /api/user/gmail-config` - Verificar configuración de Gmail
- `POST /api/user/gmail-config` - Guardar configuración de Gmail

---

## Modelo de Datos

### Esquema de Base de Datos

```prisma
model User {
  id            String      # ID único
  email         String      # Email de Google
  name          String      # Nombre completo
  image         String?     # URL de avatar
  gmailApiKey   String?     # API Key encriptada
  lastImportAt  DateTime?   # Última sincronización
  tokensUsed    Int         # Tokens IA consumidos
  emails        Email[]     # Relación con emails
  tasks         Task[]      # Relación con tareas
  comments      Comment[]   # Relación con comentarios
}

model Email {
  id         String      # ID único
  userId     String      # Usuario propietario
  gmailId    String      # ID de Gmail (único)
  senderId   String      # Email del remitente
  senderName String      # Nombre del remitente
  subject    String      # Asunto del email
  body       String      # Contenido completo
  snippet    String      # Extracto del contenido
  category   String      # Cliente | Lead | Interno
  receivedAt DateTime    # Fecha de recepción
  hasTask    Boolean     # Indica si tiene tareas
  tasks      Task[]      # Relación con tareas
}

model Task {
  id           String      # ID único
  userId       String      # Usuario propietario
  emailId      String      # Email relacionado
  title        String      # Título de la tarea
  description  String      # Descripción detallada
  priority     String      # Urgente | Alta | Media | Baja
  status       String      # Pendiente | En Progreso | Completado
  dueDate      DateTime?   # Fecha de vencimiento
  aiConfidence Int         # Nivel de confianza IA (0-100)
  comments     Comment[]   # Relación con comentarios
}

model Comment {
  id        String      # ID único
  userId    String      # Usuario autor
  taskId    String      # Tarea relacionada
  content   String      # Contenido del comentario
  createdAt DateTime    # Fecha de creación
  updatedAt DateTime    # Fecha de actualización
}
```

---

## Seguridad

### Medidas Implementadas

1. **Autenticación y Autorización**
   - OAuth 2.0 con Google
   - Tokens JWT con expiración de 7 días
   - Refresh tokens automáticos
   - Validación de sesión en middleware

2. **Encriptación de Datos**
   - AES-256-GCM para API keys
   - PBKDF2 para derivación de claves
   - Salt e IV aleatorios por encriptación
   - Sanitización de HTML con DOMPurify

3. **Protección de API**
   - Rate limiting (5 min entre sincronizaciones)
   - Validación de permisos de Gmail
   - CSRF protection (Next.js automático)
   - Validación de esquemas con Zod

4. **Buenas Prácticas**
   - Variables de entorno para secretos
   - No exposición de tokens en logs
   - Eliminación en cascada de datos relacionados
   - Índices en BD para optimizar consultas

---

## Flujo de Trabajo

### 1. Inicio de Sesión
```
Usuario → Login → Google OAuth → Sesión Creada → Dashboard
```

### 2. Sincronización de Emails
```
Click "Sincronizar" → Modal → Gmail API (20 emails) →
Gemini IA (clasificar) → Guardar en BD → Actualizar UI
```

### 3. Gestión de Tareas
```
Arrastrar Tarea → Cambiar Columna → Actualizar Estado →
API PUT /tasks/[id] → Prisma Update → Refrescar Store
```

### 4. Análisis de Datos
```
Ir a Analytics → Llamadas API paralelas → Recharts →
Renderizar Gráficos y Tablas
```

---

## Capturas de Pantalla

### Login con Google
![Login](documentation/imgs/Login.png)
### Tablero Kanban
![Kanban Board](documentation/imgs/Kanban.png)
### Email Procesados
![Emails Procesados](documentation/imgs/emailProcesados.png)
### Analisis
![Analisis](documentation/imgs/analisis.png)
### Perfil de Usuario
![Perfil de Usuario](documentation/imgs/perfil.png)


<!-- ## Roadmap

### Funcionalidades Futuras

- [ ] Notificaciones en tiempo real
- [ ] Relación inteligente entre emails relacionados
- [ ] Sistema de clientes predefinidos
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Exportación de reportes en PDF/Excel
- [ ] Modo oscuro
- [ ] Integraciones con Slack, Trello, Asana
- [ ] Asistente de IA conversacional

--- -->

## Licencia

Este proyecto es de código privado y propietario. Todos los derechos reservados.

---

## Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Vercel](https://vercel.com/) - Plataforma de despliegue
- [Google Gemini](https://ai.google.dev/) - Modelo de IA
- [Neon](https://neon.tech/) - Base de datos PostgreSQL serverless
- [ShadCN/UI](https://ui.shadcn.com/) - Componentes UI
- [dnd-kit](https://dndkit.com/) - Biblioteca de Drag & Drop

---

<!-- <div align="center">

**Hecho con dedicación por Alexander Gomez**

Si este proyecto te fue útil, considera darle una estrella en GitHub

</div> -->
