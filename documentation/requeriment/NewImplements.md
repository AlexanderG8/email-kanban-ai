# Nuevas Implementaciones - Email Kanban AI

**Fecha de Creación:** 2025-11-25
**Branch:** NewImplements
**Estado:** Pendiente de Implementación

---

## Índice

1. [Mejoras en Detail Panel](#1-mejoras-en-detail-panel)
2. [Vista de Emails Procesados](#2-vista-de-emails-procesados)
3. [Vista de Análisis](#3-vista-de-análisis)
4. [Consideraciones Técnicas](#4-consideraciones-técnicas)

---

## 1. Mejoras en Detail Panel

### 1.1 Sistema de Comentarios ( Implementado)

**Estado:** Completado

El sistema de comentarios ya está completamente implementado con las siguientes características:

-  Múltiples comentarios por tarea
-  CRUD completo (Crear, Leer, Actualizar)
-  Interfaz con avatares y timestamps
-  Edición inline de comentarios
-  Contador de comentarios
-  API endpoints en `/api/comments`

**Archivos relacionados:**
- `components/panel/DetailPanel.tsx` (líneas 430-536)
- `app/api/comments/route.ts`
- `app/api/comments/[id]/route.ts`

---

### 1.2 Scroll en Panel ( Implementado)

**Estado:** Completado

El scroll ya está implementado utilizando el componente `ScrollArea` de shadcn/ui.

**Archivo relacionado:**
- `components/panel/DetailPanel.tsx` (línea 277)

---

### 1.3 Campo Fecha de Expiración de Tarea ( Parcialmente Implementado)

**Estado:** Pendiente de completar implementación en UI

#### Estado Actual:
-  Campo `dueDate` existe en la base de datos (schema.prisma - línea 63)
-  La IA ya asigna fechas de expiración automáticamente
- ❌ **No se visualiza en el DetailPanel**
- ❌ **No es editable por el usuario**

#### Requerimientos:

**1. Visualización de Fecha de Expiración:**
- Mostrar la fecha de expiración asignada por la IA
- Ubicación sugerida: Después de las badges de prioridad y categoría
- Formato: Usar `date-fns` con locale español
- Indicador visual si la tarea está próxima a vencer o vencida

**2. Edición de Fecha de Expiración:**
- Permitir al usuario modificar la fecha asignada por la IA
- Componente sugerido: DatePicker (Radix UI Calendar + Popover)
- Validaciones:
  - No permitir fechas pasadas
  - Confirmación visual al guardar cambios
  - Manejo de errores con toast notifications
- Persistencia: Actualizar via API `PATCH /api/tasks/[id]`

**3. Diseño Visual:**
- Icono: `Calendar` o `CalendarClock` de lucide-react
- Colores indicativos:
  - Verde: Fecha lejana (> 7 días)
  - Amarillo: Próxima a vencer (3-7 días)
  - Naranja: Muy próxima (1-2 días)
  - Rojo: Vencida o vence hoy

**Tareas de Implementación:**

```typescript
// Componentes a agregar en DetailPanel.tsx
1. Import de Calendar y Popover de shadcn/ui
2. Estado local para manejar edición de fecha
3. Función handleDateChange con validación
4. Sección visual entre badges y separador
5. DatePicker con formato español
```

**Endpoints API:**
- Usar endpoint existente: `PATCH /api/tasks/[id]`
- Body: `{ dueDate: ISO8601String }`

---

## 2. Vista de Emails Procesados

**Ruta:** `/emailsprocesados`
**Archivo:** `app/emailsprocesados/page.tsx`
**Estado:** Pendiente de implementación completa

### 2.1 Objetivo

Proporcionar una vista completa de todos los emails importados y procesados, con capacidades de filtrado avanzadas y visualización detallada.

---

### 2.2 Componentes Principales

#### A. Lista de Emails Procesados

**Características:**
- Tabla/Grid con todos los emails del usuario
- Información visible por email:
  - Remitente (nombre + email)
  - Asunto
  - Clasificación (Cliente/Lead/Interno)
  - Fecha de recepción
  - Cantidad de tareas asociadas
  - Snippet del contenido

**Consideraciones de UI:**
- Usar `DataTable` o componente de lista con paginación
- Badges de colores para categorías (reutilizar esquema existente)
- Iconos para indicadores (tareas, adjuntos)
- Diseño responsive (mobile-first)

---

#### B. Sistema de Filtros

**Filtros Requeridos:**

1. **Rango de Fechas:**
   - Campo: Fecha Inicio (DatePicker)
   - Campo: Fecha Fin (DatePicker)
   - Validación: Fecha Fin >= Fecha Inicio
   - Por defecto: Últimos 30 días

2. **Clasificación:**
   - Tipo: Select/Dropdown
   - Opciones:
     - Todas
     - Cliente
     - Lead
     - Interno
   - Múltiple selección (opcional)

3. **Botón "Buscar":**
   - Ejecuta la búsqueda con los filtros aplicados
   - Indicador de loading durante búsqueda
   - Contador de resultados encontrados
   - Botón "Limpiar Filtros" para reset

**Ubicación:** Panel superior de la página (sticky header)

---

#### C. Modal de Detalle de Email

**Trigger:** Click en cualquier email de la lista

**Contenido del Modal:**

1. **Información del Email:**
   - Header con remitente y avatar
   - Asunto
   - Fecha de recepción
   - Clasificación (badge)
   - Cuerpo del email (HTML sanitizado con DOMPurify)
     - Scroll interno si el contenido es largo
     - Límite de altura máxima

2. **Lista de Tareas Asociadas:**
   - Tarjetas compactas de tareas
   - Información por tarea:
     - Título
     - Estado (Pendiente/En Progreso/Completado)
     - Prioridad
     - Fecha de expiración (si existe)
   - Click en tarea: Abrir DetailPanel (transición suave)

**Diseño del Modal:**
- Similar a DetailPanel (consistencia visual)
- Ancho: 600px (pantallas grandes)
- Responsive: Full width en mobile
- Close con ESC o backdrop click
- Animaciones suaves (slide-in)

---

### 2.3 API Endpoint Necesario

**Nuevo endpoint:** `GET /api/emails/processed`

**Query Parameters:**
```typescript
{
  startDate?: string; // ISO8601
  endDate?: string;   // ISO8601
  category?: string | string[]; // "Cliente" | "Lead" | "Interno"
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  emails: Email[];
  total: number;
  page: number;
  totalPages: number;
}
```

**Optimizaciones:**
- Incluir `tasks` en la respuesta (eager loading)
- Índices en BD para queries rápidas
- Paginación para evitar overload

---

### 2.4 Tareas de Implementación

```
[ ] 1. Crear componente EmailsProcessedPage
[ ] 2. Implementar FilterBar con DateRangePicker y CategorySelect
[ ] 3. Crear EmailsTable/EmailsGrid con datos
[ ] 4. Implementar EmailDetailModal
[ ] 5. Crear API endpoint GET /api/emails/processed
[ ] 6. Agregar paginación
[ ] 7. Testing y responsive design
[ ] 8. Manejo de estados vacíos (sin emails)
[ ] 9. Skeleton loaders durante carga
[ ] 10. Integración con DetailPanel para tareas
```

---

## 3. Vista de Análisis

**Ruta:** `/analisis`
**Archivo:** `app/analisis/page.tsx`
**Estado:** Pendiente de implementación completa

### 3.1 Objetivo

Proporcionar insights accionables y visualizaciones estadísticas profesionales que ayuden al usuario a gestionar mejor sus tareas y emails.

---

### 3.2 Principios de Diseño de Analytics

**Filosofía:**
- **Relevancia sobre cantidad:** Solo métricas que impulsen decisiones
- **Claridad visual:** Gráficos simples y legibles
- **Contexto temporal:** Comparaciones con periodos anteriores
- **Accionabilidad:** Cada métrica debe sugerir una acción

---

### 3.3 Métricas y Visualizaciones Recomendadas

#### A. KPIs Principales (Cards superiores)

1. **Total de Tareas Activas**
   - Número: Tareas en Pendiente + En Progreso
   - Tendencia: ↑↓ vs. semana anterior
   - Color: Indicador de carga de trabajo

2. **Tasa de Completación**
   - Fórmula: (Completadas / Total) × 100
   - Período: Últimos 30 días
   - Objetivo: > 70% (configurable)

3. **Emails Procesados Hoy**
   - Contador con gráfico sparkline
   - Clasificación rápida (Cliente/Lead/Interno)

4. **Tiempo Promedio de Resolución**
   - Desde creación hasta completado
   - Comparación con promedio general
   - Identificar cuellos de botella

---

#### B. Gráficos Principales

**1. Distribución de Tareas por Estado (Donut/Pie Chart)**
- Segmentos: Pendiente, En Progreso, Completado
- Porcentajes y contadores
- Click para filtrar

**2. Tareas por Prioridad (Bar Chart Horizontal)**
- Barras: Urgente, Alta, Media, Baja
- Apiladas por estado
- Identificar sobrecarga de urgentes

**3. Timeline de Completación (Line Chart)**
- Eje X: Últimos 30 días
- Eje Y: Tareas completadas por día
- Línea de tendencia

**4. Emails por Categoría (Stacked Area Chart)**
- Evolución temporal de Cliente/Lead/Interno
- Identificar patrones de comunicación

**5. Heatmap de Productividad**
- Días de la semana vs. Horas del día
- Cuando se completan más tareas
- Optimizar horarios de trabajo

---

#### C. Tablas de Insights

**1. Top Remitentes**
- Ranking de quienes envían más emails
- Tareas generadas por remitente
- Tasa de completación por remitente

**2. Tareas Próximas a Vencer**
- Lista de tareas con dueDate < 7 días
- Ordenadas por urgencia
- Acciones rápidas (marcar completada, cambiar estado)

**3. Tareas Vencidas**
- Filtro de tareas con dueDate < hoy
- Alerta visual prominente
- Sugerencia de reasignación de fechas

---

### 3.4 Herramientas Recomendadas

**Librería de Gráficos:**
- **Recharts** (recomendado)
  - Integración nativa con React
  - Componentes responsivos
  - Customizable y accesible
  - Tamaño moderado

- Alternativas:
  - Chart.js + react-chartjs-2
  - Victory Charts
  - Nivo

**Componentes UI:**
- Cards con shadcn/ui
- Tabs para organizar secciones
- DateRangePicker para filtros temporales
- Export a PDF/CSV (futuro)

---

### 3.5 Estructura de la Página

```
                                             
  Filtros Temporales (Hoy/Semana/Mes/Custom) 
                                             

          ,          ,          ,          
  KPI 1     KPI 2     KPI 3     KPI 4   
  Card      Card      Card      Card    
          4          4          4          

                     ,                      
  Distribución         Tareas por          
  por Estado           Prioridad           
  (Donut)              (Bar Chart)         
                     4                      

                                              
  Timeline de Completación (Line Chart)       
                                              

                     ,                      
  Emails por           Heatmap de          
  Categoría            Productividad       
  (Area Chart)                             
                     4                      

                                              
  Tablas de Insights                          
  (Top Remitentes, Próximas a Vencer, etc.)   
                                              
```

---

### 3.6 API Endpoints Necesarios

**1. GET `/api/analytics/overview`**
```typescript
Response: {
  activeTasks: number;
  completionRate: number;
  emailsToday: number;
  avgResolutionTime: number; // en horas
  trends: {
    activeTasks: number; // diferencia con período anterior
    completionRate: number;
  }
}
```

**2. GET `/api/analytics/tasks-distribution`**
```typescript
Response: {
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number; byStatus: {} }[];
}
```

**3. GET `/api/analytics/timeline`**
```typescript
Query: { startDate, endDate }
Response: {
  completions: { date: string; count: number }[];
}
```

**4. GET `/api/analytics/emails-category`**
```typescript
Response: {
  timeline: { date: string; Cliente: number; Lead: number; Interno: number }[];
}
```

**5. GET `/api/analytics/top-senders`**
```typescript
Response: {
  senders: {
    email: string;
    name: string;
    emailCount: number;
    tasksGenerated: number;
    completionRate: number;
  }[];
}
```

**6. GET `/api/analytics/upcoming-tasks`**
```typescript
Query: { daysAhead: number }
Response: {
  tasks: Task[]; // con relaciones de email
}
```

---

### 3.7 Tareas de Implementación

```
[ ] 1. Instalar Recharts: npm install recharts
[ ] 2. Crear componente AnalyticsPage base
[ ] 3. Implementar FilterBar (DateRange, presets)
[ ] 4. Crear componentes de KPI Cards
[ ] 5. Implementar gráficos:
    [ ] TaskDistributionChart (Donut)
    [ ] TasksByPriorityChart (Bar)
    [ ] CompletionTimelineChart (Line)
    [ ] EmailsByCategoryChart (Area)
    [ ] ProductivityHeatmap
[ ] 6. Crear tablas de insights
[ ] 7. Implementar API endpoints de analytics
[ ] 8. Agregar queries optimizadas en Prisma
[ ] 9. Testing de visualizaciones
[ ] 10. Responsive design
[ ] 11. Export de reportes (PDF/CSV) - Futuro
[ ] 12. Caching de analytics (Redis/Memory) - Futuro
```

---

## 4. Consideraciones Técnicas

### 4.1 Base de Datos

**Índices necesarios (ya existen):**
```prisma
@@index([userId, status])      // Task
@@index([userId, priority])    // Task
@@index([userId, receivedAt])  // Email
@@index([userId, category])    // Email
```

**Posibles índices adicionales:**
```prisma
@@index([userId, dueDate])     // Para queries de fechas de expiración
@@index([createdAt])           // Para analytics temporales
```

---

### 4.2 Rendimiento

**Optimizaciones:**
1. Implementar paginación en todas las listas
2. Usar `useMemo` para cálculos pesados en analytics
3. Lazy loading de gráficos (React.lazy)
4. Server-side filtering para emails procesados
5. Considerar agregaciones en BD vs. JS (preferir BD)

**Límites:**
- Emails procesados: 50 por página
- Analytics: Datos de últimos 90 días por defecto
- Top remitentes: Máximo 10

---

### 4.3 UX/UI

**Consistencia:**
- Reutilizar componentes de shadcn/ui
- Mantener esquema de colores existente:
  - Prioridad: priorityColors (DetailPanel.tsx:42)
  - Categoría: categoryColors (DetailPanel.tsx:49)
- Animaciones suaves (Framer Motion opcional)
- Estados de loading consistentes (Skeleton loaders)

**Accesibilidad:**
- ARIA labels en gráficos
- Keyboard navigation en modales
- Contraste adecuado (WCAG AA)
- Screen reader friendly

---

### 4.4 Testing

**Casos de prueba:**
1. Emails procesados sin resultados
2. Filtros con rangos de fechas inválidos
3. Analytics con datos vacíos (usuario nuevo)
4. Responsive en mobile/tablet
5. Rendimiento con 1000+ emails
6. Navegación DetailPanel ↔ EmailModal

---

### 4.5 Dependencias Nuevas

```json
{
  "recharts": "^2.15.0",           // Para gráficos
  "react-day-picker": "^9.4.3",    // DatePicker (ya incluido en shadcn)
  "date-fns": "^4.1.0"             // Ya instalado
}
```

---

## Resumen de Implementación


### Prioridad Alta (MVP)
1. ✅ Comentarios en tareas (Completado)
2. ✅ Scroll en DetailPanel (Completado)
3. ⚠️ Campo fecha de expiración editable
4. Vista de Emails Procesados (funcionalidad core)

### Prioridad Media
5. Vista de Análisis (gráficos básicos)
6. Modal de detalle de email

### Prioridad Baja (Futuras mejoras)
7. Analytics avanzados (heatmap, predicciones)
8. Export de reportes
9. Notificaciones de tareas vencidas

---

**Última actualización:** 2025-11-25
**Responsable:** Development Team
**Versión del documento:** 1.0
