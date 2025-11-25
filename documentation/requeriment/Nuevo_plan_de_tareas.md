# Plan de Tareas por Sprints - Email Kanban AI

**Proyecto:** Email Kanban AI - Nuevas Implementaciones
**Branch:** NewImplements
**Fecha de Creación:** 2025-11-25
**Duración Estimada:** 6 Sprints (12 semanas aproximadamente)

---

## Índice de Sprints

1. [Sprint 1: Fecha de Expiración en DetailPanel](#sprint-1-fecha-de-expiración-en-detailpanel)
2. [Sprint 2: Vista de Emails Procesados - Backend](#sprint-2-vista-de-emails-procesados---backend)
3. [Sprint 3: Vista de Emails Procesados - Frontend](#sprint-3-vista-de-emails-procesados---frontend)
4. [Sprint 4: Vista de Análisis - Fundamentos](#sprint-4-vista-de-análisis---fundamentos)
5. [Sprint 5: Vista de Análisis - Gráficos Avanzados](#sprint-5-vista-de-análisis---gráficos-avanzados)
6. [Sprint 6: Testing y Optimización Final](#sprint-6-testing-y-optimización-final)

---

## Sprint 1: Fecha de Expiración en DetailPanel

**Duración:** 1 semana
**Objetivo:** Completar la funcionalidad de fecha de expiración en tareas, permitiendo visualización y edición.

### Tareas

#### 1.1 Instalación de Componentes UI
- [ ] Instalar/verificar componente Calendar de shadcn/ui
  ```bash
  npx shadcn@latest add calendar
  npx shadcn@latest add popover
  ```
- [ ] Verificar dependencias: date-fns (ya instalado)

**Archivos:**
- `components/ui/calendar.tsx`
- `components/ui/popover.tsx`

**Estimación:** 0.5 horas

---

#### 1.2 Agregar Imports y Estado Local
- [ ] Importar componentes Calendar, Popover, CalendarIcon en DetailPanel.tsx
- [ ] Agregar estado local:
  ```typescript
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(task.dueDate);
  ```

**Archivos:**
- `components/panel/DetailPanel.tsx`

**Estimación:** 0.5 horas

---

#### 1.3 Función de Validación y Guardado
- [ ] Crear función `handleDateChange` con:
  - Validación de fecha no pasada
  - Llamada a API `PATCH /api/tasks/[id]`
  - Actualización optimista en Zustand
  - Manejo de errores con toast
  - Reset de estado de edición

**Código sugerido:**
```typescript
const handleDateChange = async (date: Date | undefined) => {
  if (!task || !date) return;

  // Validar fecha no pasada
  if (date < new Date()) {
    toast.error("No se puede asignar una fecha pasada");
    return;
  }

  setIsSavingDate(true);
  try {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: date.toISOString() }),
    });

    if (!response.ok) throw new Error("Error al actualizar fecha");

    updateTask(task.id, { dueDate: date, updatedAt: new Date() });
    setSelectedDate(date);
    setIsEditingDate(false);
    toast.success("Fecha de expiración actualizada");
  } catch (error) {
    console.error("Error updating date:", error);
    toast.error("Error al actualizar fecha");
  } finally {
    setIsSavingDate(false);
  }
};
```

**Archivos:**
- `components/panel/DetailPanel.tsx`

**Estimación:** 1 hora

---

#### 1.4 Función de Cálculo de Estado de Fecha
- [ ] Crear función helper para determinar el estado de la fecha:
  ```typescript
  const getDueDateStatus = (dueDate: Date | null) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: "text-red-600", label: "Vencida", bg: "bg-red-50" };
    if (diffDays === 0) return { color: "text-red-600", label: "Vence hoy", bg: "bg-red-50" };
    if (diffDays <= 2) return { color: "text-orange-600", label: "Muy próxima", bg: "bg-orange-50" };
    if (diffDays <= 7) return { color: "text-yellow-600", label: "Próxima", bg: "bg-yellow-50" };
    return { color: "text-green-600", label: "A tiempo", bg: "bg-green-50" };
  };
  ```

**Archivos:**
- `components/panel/DetailPanel.tsx`

**Estimación:** 0.5 horas

---

#### 1.5 UI de Visualización de Fecha
- [ ] Agregar sección visual de fecha de expiración después de badges (línea ~295 en DetailPanel.tsx)
- [ ] Mostrar fecha formateada con `format(dueDate, "PPP", { locale: es })`
- [ ] Badge con estado de la fecha (color según proximidad)
- [ ] Icono CalendarClock de lucide-react

**Código sugerido:**
```tsx
{/* Fecha de Expiración */}
{task.dueDate && (
  <div className="flex items-center gap-2 mt-2">
    <CalendarClock className="h-4 w-4 text-muted-foreground" />
    <div className="flex items-center gap-2">
      <span className="text-sm">
        {format(new Date(task.dueDate), "PPP", { locale: es })}
      </span>
      {getDueDateStatus(task.dueDate) && (
        <Badge variant="outline" className={cn(
          "text-xs",
          getDueDateStatus(task.dueDate)?.color,
          getDueDateStatus(task.dueDate)?.bg
        )}>
          {getDueDateStatus(task.dueDate)?.label}
        </Badge>
      )}
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 ml-auto"
      onClick={() => setIsEditingDate(true)}
    >
      <Pencil className="h-3 w-3" />
    </Button>
  </div>
)}
```

**Archivos:**
- `components/panel/DetailPanel.tsx`

**Estimación:** 1.5 horas

---

#### 1.6 UI de Edición de Fecha (DatePicker)
- [ ] Implementar Popover con Calendar para edición
- [ ] Integrar con estado `isEditingDate`
- [ ] Botones de acción: Guardar y Cancelar
- [ ] Loading state durante guardado

**Código sugerido:**
```tsx
{/* DatePicker Popover */}
<Popover open={isEditingDate} onOpenChange={setIsEditingDate}>
  <PopoverTrigger asChild>
    <span /> {/* trigger controlado por botón de edición */}
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      disabled={(date) => date < new Date()}
      initialFocus
      locale={es}
    />
    <div className="p-3 border-t flex gap-2">
      <Button
        size="sm"
        onClick={() => handleDateChange(selectedDate)}
        disabled={isSavingDate || !selectedDate}
      >
        {isSavingDate ? <Loader2 className="h-3 w-3 animate-spin" /> : "Guardar"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditingDate(false)}
      >
        Cancelar
      </Button>
    </div>
  </PopoverContent>
</Popover>
```

**Archivos:**
- `components/panel/DetailPanel.tsx`

**Estimación:** 2 horas

---

#### 1.7 Actualización de API Endpoint
- [ ] Verificar que `PATCH /api/tasks/[id]` acepta campo `dueDate`
- [ ] Agregar validación de fecha en backend (si no existe)
- [ ] Test de actualización de fecha

**Archivos:**
- `app/api/tasks/[id]/route.ts`

**Estimación:** 1 hora

---

#### 1.8 Testing de Fecha de Expiración
- [ ] Probar visualización de fecha existente
- [ ] Probar edición de fecha
- [ ] Probar validación de fecha pasada
- [ ] Probar estados de color (vencida, próxima, a tiempo)
- [ ] Probar responsive design
- [ ] Probar manejo de errores

**Estimación:** 1 hora

---

### Entregables Sprint 1
- ✅ Visualización de fecha de expiración con indicadores de color
- ✅ Edición de fecha mediante DatePicker
- ✅ Validaciones y manejo de errores
- ✅ Integración con API existente

**Total Estimado:** 8.5 horas

---

## Sprint 2: Vista de Emails Procesados - Backend

**Duración:** 2 semanas
**Objetivo:** Crear la infraestructura backend y API para la vista de emails procesados.

### Tareas

#### 2.1 Análisis de Base de Datos
- [ ] Revisar modelo Email en Prisma
- [ ] Verificar índices existentes para queries optimizadas
- [ ] Planificar queries de filtrado

**Archivos:**
- `prisma/schema.prisma`

**Estimación:** 1 hora

---

#### 2.2 Crear API Endpoint Principal
- [ ] Crear archivo `app/api/emails/processed/route.ts`
- [ ] Implementar handler GET con autenticación
- [ ] Estructura básica de respuesta

**Código base:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // TODO: Implementar lógica

  } catch (error) {
    console.error("Error fetching processed emails:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
```

**Archivos:**
- `app/api/emails/processed/route.ts`

**Estimación:** 1.5 horas

---

#### 2.3 Implementar Filtros de Búsqueda
- [ ] Parsear query parameters: startDate, endDate, category, page, limit
- [ ] Validar parámetros (fechas válidas, rango correcto)
- [ ] Construir objeto where de Prisma dinámicamente

**Código sugerido:**
```typescript
const { searchParams } = new URL(req.url);
const startDate = searchParams.get("startDate");
const endDate = searchParams.get("endDate");
const category = searchParams.get("category");
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "50");

const where: any = { userId: user.id };

if (startDate && endDate) {
  where.receivedAt = {
    gte: new Date(startDate),
    lte: new Date(endDate),
  };
}

if (category && category !== "Todas") {
  where.category = category;
}
```

**Archivos:**
- `app/api/emails/processed/route.ts`

**Estimación:** 2 horas

---

#### 2.4 Implementar Paginación
- [ ] Calcular skip y take para Prisma
- [ ] Query de conteo total
- [ ] Calcular totalPages

**Código sugerido:**
```typescript
const skip = (page - 1) * limit;

const [emails, total] = await Promise.all([
  prisma.email.findMany({
    where,
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      },
    },
    orderBy: { receivedAt: "desc" },
    skip,
    take: limit,
  }),
  prisma.email.count({ where }),
]);

const totalPages = Math.ceil(total / limit);
```

**Archivos:**
- `app/api/emails/processed/route.ts`

**Estimación:** 1.5 horas

---

#### 2.5 Optimización de Queries
- [ ] Implementar eager loading de tasks (include)
- [ ] Seleccionar solo campos necesarios
- [ ] Verificar uso de índices (EXPLAIN en PostgreSQL)

**Archivos:**
- `app/api/emails/processed/route.ts`

**Estimación:** 1 hora

---

#### 2.6 Testing de API
- [ ] Test con Postman/Thunder Client:
  - Sin filtros
  - Con filtro de fecha
  - Con filtro de categoría
  - Con paginación
  - Casos de error (fechas inválidas, no autenticado)
- [ ] Documentar ejemplos de requests

**Estimación:** 2 horas

---

#### 2.7 Crear Tipos TypeScript
- [ ] Definir tipos de respuesta en `types/` o en el endpoint
- [ ] Tipos para query parameters

**Código sugerido:**
```typescript
// types/emails.ts
export interface ProcessedEmailsResponse {
  emails: EmailWithTasks[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EmailWithTasks extends Email {
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: Date | null;
  }[];
}
```

**Archivos:**
- `types/emails.ts` (nuevo)

**Estimación:** 1 hora

---

### Entregables Sprint 2
- ✅ API endpoint `GET /api/emails/processed` funcional
- ✅ Filtros de fecha y categoría
- ✅ Paginación implementada
- ✅ Queries optimizadas con eager loading
- ✅ Tipos TypeScript definidos

**Total Estimado:** 10 horas

---

## Sprint 3: Vista de Emails Procesados - Frontend

**Duración:** 2 semanas
**Objetivo:** Crear la interfaz de usuario para visualizar y filtrar emails procesados.

### Tareas

#### 3.1 Crear Componente Base
- [ ] Crear archivo `app/emailsprocesados/page.tsx`
- [ ] Estructura básica con layout
- [ ] Metadata de la página

**Código base:**
```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emails Procesados | Email Kanban AI",
  description: "Historial de emails procesados y clasificados",
};

export default function EmailsProcessedPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Emails Procesados</h1>
      {/* Contenido */}
    </div>
  );
}
```

**Archivos:**
- `app/emailsprocesados/page.tsx`

**Estimación:** 0.5 horas

---

#### 3.2 Crear Componente FilterBar
- [ ] Crear `components/emails/FilterBar.tsx`
- [ ] Implementar DateRangePicker (Fecha Inicio + Fecha Fin)
- [ ] Implementar Select de Categorías
- [ ] Botón "Buscar" y "Limpiar Filtros"
- [ ] Estado local para filtros

**Estructura:**
```typescript
interface FilterBarProps {
  onSearch: (filters: EmailFilters) => void;
}

interface EmailFilters {
  startDate: Date | undefined;
  endDate: Date | undefined;
  category: string;
}
```

**Archivos:**
- `components/emails/FilterBar.tsx` (nuevo)

**Estimación:** 3 horas

---

#### 3.3 Crear Componente EmailsTable
- [ ] Crear `components/emails/EmailsTable.tsx`
- [ ] Tabla responsive con columnas:
  - Remitente (avatar + nombre)
  - Asunto (truncado)
  - Categoría (badge)
  - Fecha de recepción
  - Nº de tareas
  - Acción (ver detalle)
- [ ] Hover states y click handlers

**Archivos:**
- `components/emails/EmailsTable.tsx` (nuevo)

**Estimación:** 4 horas

---

#### 3.4 Implementar Paginación en UI
- [ ] Crear componente PaginationControls
- [ ] Botones: Primera, Anterior, Siguiente, Última
- [ ] Indicador de página actual y total
- [ ] Integración con estado de página

**Archivos:**
- `components/emails/PaginationControls.tsx` (nuevo)

**Estimación:** 2 horas

---

#### 3.5 Integrar con API
- [ ] Implementar fetch a `/api/emails/processed`
- [ ] Estado de loading con Skeleton loaders
- [ ] Manejo de errores con mensajes
- [ ] Refetch al cambiar filtros/página

**Código sugerido:**
```typescript
const [emails, setEmails] = useState<EmailWithTasks[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

const fetchEmails = async (filters: EmailFilters, page: number) => {
  setIsLoading(true);
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "50",
      ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
      ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
      ...(filters.category !== "Todas" && { category: filters.category }),
    });

    const response = await fetch(`/api/emails/processed?${params}`);
    if (!response.ok) throw new Error("Error al cargar emails");

    const data = await response.json();
    setEmails(data.emails);
    setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
  } catch (error) {
    console.error(error);
    toast.error("Error al cargar emails procesados");
  } finally {
    setIsLoading(false);
  }
};
```

**Archivos:**
- `app/emailsprocesados/page.tsx`

**Estimación:** 2.5 horas

---

#### 3.6 Crear Skeleton Loaders
- [ ] Crear `components/emails/EmailsTableSkeleton.tsx`
- [ ] Diseño que coincida con la tabla real
- [ ] Animaciones de shimmer

**Archivos:**
- `components/emails/EmailsTableSkeleton.tsx` (nuevo)

**Estimación:** 1 hora

---

#### 3.7 Estado Vacío (Empty State)
- [ ] Componente para cuando no hay emails
- [ ] Mensaje claro y accionable
- [ ] Icono ilustrativo

**Código sugerido:**
```tsx
{emails.length === 0 && !isLoading && (
  <div className="text-center py-12">
    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">No se encontraron emails</h3>
    <p className="text-muted-foreground">
      Intenta ajustar los filtros o importar nuevos emails.
    </p>
  </div>
)}
```

**Archivos:**
- `app/emailsprocesados/page.tsx`

**Estimación:** 0.5 horas

---

#### 3.8 Crear EmailDetailModal
- [ ] Crear `components/emails/EmailDetailModal.tsx`
- [ ] Estructura similar a DetailPanel (consistencia)
- [ ] Secciones:
  - Header del email (remitente, asunto, fecha)
  - Cuerpo del email (sanitizado, con scroll)
  - Lista de tareas asociadas
- [ ] Animaciones de entrada/salida
- [ ] Close con ESC y backdrop click

**Archivos:**
- `components/emails/EmailDetailModal.tsx` (nuevo)

**Estimación:** 4 horas

---

#### 3.9 Integrar Modal con DetailPanel
- [ ] Click en tarea dentro del modal → abrir DetailPanel
- [ ] Manejar estado de ambos modales simultáneamente
- [ ] Transiciones suaves

**Archivos:**
- `components/emails/EmailDetailModal.tsx`
- `app/emailsprocesados/page.tsx`

**Estimación:** 1.5 horas

---

#### 3.10 Responsive Design
- [ ] Adaptar tabla para mobile (cards en lugar de tabla)
- [ ] FilterBar responsive (stack en mobile)
- [ ] Modal full-width en mobile
- [ ] Testing en diferentes viewports

**Estimación:** 2 horas

---

### Entregables Sprint 3
- ✅ Página de emails procesados completamente funcional
- ✅ Filtros de fecha y categoría operativos
- ✅ Tabla con paginación
- ✅ Modal de detalle de email
- ✅ Integración con DetailPanel para tareas
- ✅ Diseño responsive

**Total Estimado:** 21 horas

---

## Sprint 4: Vista de Análisis - Fundamentos

**Duración:** 2 semanas
**Objetivo:** Implementar la base de analytics con KPIs y gráficos básicos.

### Tareas

#### 4.1 Instalación de Dependencias
- [ ] Instalar Recharts:
  ```bash
  npm install recharts
  ```
- [ ] Verificar compatibilidad con React 19

**Estimación:** 0.25 horas

---

#### 4.2 Crear API Endpoint: Overview
- [ ] Crear `app/api/analytics/overview/route.ts`
- [ ] Calcular métricas:
  - Total de tareas activas (Pendiente + En Progreso)
  - Tasa de completación (últimos 30 días)
  - Emails procesados hoy
  - Tiempo promedio de resolución
  - Tendencias vs. período anterior

**Código sugerido:**
```typescript
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

const [activeTasks, completedTasks, allTasks, emailsToday] = await Promise.all([
  prisma.task.count({
    where: {
      userId: user.id,
      status: { in: ["Pendiente", "En Progreso"] },
    },
  }),
  prisma.task.count({
    where: {
      userId: user.id,
      status: "Completado",
      updatedAt: { gte: thirtyDaysAgo },
    },
  }),
  prisma.task.count({
    where: {
      userId: user.id,
      createdAt: { gte: thirtyDaysAgo },
    },
  }),
  prisma.email.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: new Date(now.setHours(0, 0, 0, 0)),
      },
    },
  }),
]);

const completionRate = allTasks > 0 ? (completedTasks / allTasks) * 100 : 0;
```

**Archivos:**
- `app/api/analytics/overview/route.ts` (nuevo)

**Estimación:** 3 horas

---

#### 4.3 Crear API Endpoint: Tasks Distribution
- [ ] Crear `app/api/analytics/tasks-distribution/route.ts`
- [ ] Agrupar tareas por estado
- [ ] Agrupar tareas por prioridad (con breakdown por estado)

**Código sugerido:**
```typescript
const tasks = await prisma.task.findMany({
  where: { userId: user.id },
  select: { status: true, priority: true },
});

const byStatus = tasks.reduce((acc, task) => {
  acc[task.status] = (acc[task.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const byPriority = tasks.reduce((acc, task) => {
  if (!acc[task.priority]) {
    acc[task.priority] = { total: 0, byStatus: {} };
  }
  acc[task.priority].total++;
  acc[task.priority].byStatus[task.status] =
    (acc[task.priority].byStatus[task.status] || 0) + 1;
  return acc;
}, {} as any);
```

**Archivos:**
- `app/api/analytics/tasks-distribution/route.ts` (nuevo)

**Estimación:** 2.5 horas

---

#### 4.4 Crear API Endpoint: Timeline
- [ ] Crear `app/api/analytics/timeline/route.ts`
- [ ] Datos de completación por día (últimos 30 días)
- [ ] Agregar por fecha

**Archivos:**
- `app/api/analytics/timeline/route.ts` (nuevo)

**Estimación:** 2 horas

---

#### 4.5 Crear Componente Base AnalyticsPage
- [ ] Crear `app/analisis/page.tsx`
- [ ] Layout y estructura de secciones
- [ ] Filtros temporales (presets: Hoy, Semana, Mes, Custom)

**Archivos:**
- `app/analisis/page.tsx`

**Estimación:** 1.5 horas

---

#### 4.6 Crear Componente KPICard
- [ ] Crear `components/analytics/KPICard.tsx`
- [ ] Props: título, valor, tendencia, icono
- [ ] Indicador visual de tendencia (↑↓)
- [ ] Diseño con shadcn/ui Card

**Archivos:**
- `components/analytics/KPICard.tsx` (nuevo)

**Estimación:** 2 horas

---

#### 4.7 Implementar KPIs Principales
- [ ] Integrar 4 KPICards en AnalyticsPage
- [ ] Fetch de datos desde `/api/analytics/overview`
- [ ] Loading states

**Archivos:**
- `app/analisis/page.tsx`

**Estimación:** 2 horas

---

#### 4.8 Crear TaskDistributionChart (Donut)
- [ ] Crear `components/analytics/TaskDistributionChart.tsx`
- [ ] Usar Recharts PieChart con innerRadius (donut)
- [ ] Datos de `/api/analytics/tasks-distribution`
- [ ] Colores consistentes con tema

**Archivos:**
- `components/analytics/TaskDistributionChart.tsx` (nuevo)

**Estimación:** 3 horas

---

#### 4.9 Crear TasksByPriorityChart (Bar)
- [ ] Crear `components/analytics/TasksByPriorityChart.tsx`
- [ ] Usar Recharts BarChart horizontal
- [ ] Barras apiladas por estado
- [ ] Tooltip informativo

**Archivos:**
- `components/analytics/TasksByPriorityChart.tsx` (nuevo)

**Estimación:** 3 horas

---

#### 4.10 Testing de Analytics Básicos
- [ ] Verificar cálculos de KPIs
- [ ] Probar con datos vacíos (usuario nuevo)
- [ ] Responsive design de gráficos
- [ ] Performance con datasets grandes

**Estimación:** 2 horas

---

### Entregables Sprint 4
- ✅ API endpoints de analytics (overview, distribution, timeline)
- ✅ Página de análisis con estructura base
- ✅ 4 KPIs principales funcionales
- ✅ Gráfico de distribución por estado (Donut)
- ✅ Gráfico de tareas por prioridad (Bar)

**Total Estimado:** 21.25 horas

---

## Sprint 5: Vista de Análisis - Gráficos Avanzados

**Duración:** 2 semanas
**Objetivo:** Completar visualizaciones avanzadas y tablas de insights.

### Tareas

#### 5.1 Crear API Endpoint: Emails by Category
- [ ] Crear `app/api/analytics/emails-category/route.ts`
- [ ] Timeline de emails agrupados por categoría (últimos 30 días)
- [ ] Estructura: `{ date, Cliente, Lead, Interno }`

**Archivos:**
- `app/api/analytics/emails-category/route.ts` (nuevo)

**Estimación:** 2 horas

---

#### 5.2 Crear API Endpoint: Top Senders
- [ ] Crear `app/api/analytics/top-senders/route.ts`
- [ ] Ranking de remitentes por:
  - Cantidad de emails
  - Tareas generadas
  - Tasa de completación
- [ ] Limitar a top 10

**Archivos:**
- `app/api/analytics/top-senders/route.ts` (nuevo)

**Estimación:** 2.5 horas

---

#### 5.3 Crear API Endpoint: Upcoming Tasks
- [ ] Crear `app/api/analytics/upcoming-tasks/route.ts`
- [ ] Query parameter: daysAhead (default: 7)
- [ ] Tareas con dueDate en los próximos N días
- [ ] Incluir datos de email relacionado

**Archivos:**
- `app/api/analytics/upcoming-tasks/route.ts` (nuevo)

**Estimación:** 1.5 horas

---

#### 5.4 Crear CompletionTimelineChart (Line)
- [ ] Crear `components/analytics/CompletionTimelineChart.tsx`
- [ ] Usar Recharts LineChart
- [ ] Datos de `/api/analytics/timeline`
- [ ] Eje X: Fechas, Eje Y: Tareas completadas
- [ ] Área bajo la curva (AreaChart como alternativa)

**Archivos:**
- `components/analytics/CompletionTimelineChart.tsx` (nuevo)

**Estimación:** 3 horas

---

#### 5.5 Crear EmailsByCategoryChart (Stacked Area)
- [ ] Crear `components/analytics/EmailsByCategoryChart.tsx`
- [ ] Usar Recharts AreaChart apilado
- [ ] Datos de `/api/analytics/emails-category`
- [ ] 3 áreas: Cliente, Lead, Interno
- [ ] Colores consistentes con categoryColors

**Archivos:**
- `components/analytics/EmailsByCategoryChart.tsx` (nuevo)

**Estimación:** 3.5 horas

---

#### 5.6 Crear ProductivityHeatmap
- [ ] Crear `components/analytics/ProductivityHeatmap.tsx`
- [ ] Heatmap: Días de la semana vs. Horas del día
- [ ] Calcular en qué momentos se completan más tareas
- [ ] Escala de colores (verde intensidad)
- [ ] Tooltip con conteo

**Nota:** Considerar usar librería auxiliar o implementar custom con SVG

**Archivos:**
- `components/analytics/ProductivityHeatmap.tsx` (nuevo)

**Estimación:** 5 horas

---

#### 5.7 Crear TopSendersTable
- [ ] Crear `components/analytics/TopSendersTable.tsx`
- [ ] Tabla con columnas:
  - Posición (#)
  - Remitente (nombre + email)
  - Total emails
  - Tareas generadas
  - Tasa de completación (badge con color)
- [ ] Datos de `/api/analytics/top-senders`

**Archivos:**
- `components/analytics/TopSendersTable.tsx` (nuevo)

**Estimación:** 2.5 horas

---

#### 5.8 Crear UpcomingTasksTable
- [ ] Crear `components/analytics/UpcomingTasksTable.tsx`
- [ ] Lista de tareas próximas a vencer
- [ ] Ordenadas por urgencia (dueDate ASC)
- [ ] Acciones rápidas: Cambiar estado
- [ ] Badge de "Vence en X días"

**Archivos:**
- `components/analytics/UpcomingTasksTable.tsx` (nuevo)

**Estimación:** 2.5 horas

---

#### 5.9 Integrar Todos los Componentes en AnalyticsPage
- [ ] Layout de 2 columnas para gráficos
- [ ] Sección de tablas de insights al final
- [ ] Tabs para organizar vistas (opcional)
- [ ] Scroll suave

**Archivos:**
- `app/analisis/page.tsx`

**Estimación:** 2 horas

---

#### 5.10 Optimización de Queries Analytics
- [ ] Revisar queries de Prisma
- [ ] Agregar índices si es necesario:
  ```prisma
  @@index([userId, dueDate])
  @@index([createdAt])
  ```
- [ ] Considerar agregaciones en BD vs. JS
- [ ] Caching de resultados (opcional: en memoria por 5 min)

**Archivos:**
- `prisma/schema.prisma`
- Todos los endpoints de analytics

**Estimación:** 2 horas

---

#### 5.11 Testing de Analytics Avanzados
- [ ] Verificar precisión de datos en heatmap
- [ ] Probar filtros temporales
- [ ] Testing con datasets variados
- [ ] Performance en gráficos complejos
- [ ] Responsive design completo

**Estimación:** 2.5 horas

---

### Entregables Sprint 5
- ✅ Gráfico de timeline de completación (Line)
- ✅ Gráfico de emails por categoría (Stacked Area)
- ✅ Heatmap de productividad
- ✅ Tabla de top remitentes
- ✅ Tabla de tareas próximas a vencer
- ✅ Vista de análisis completamente funcional

**Total Estimado:** 29 horas

---

## Sprint 6: Testing y Optimización Final

**Duración:** 1 semana
**Objetivo:** Testing integral, optimización de rendimiento, y pulido final.

### Tareas

#### 6.1 Testing End-to-End
- [ ] Testing completo de flujo DetailPanel:
  - Visualización de fecha de expiración
  - Edición de fecha
  - Validaciones
- [ ] Testing completo de flujo Emails Procesados:
  - Filtros de búsqueda
  - Paginación
  - Modal de detalle
  - Integración con DetailPanel
- [ ] Testing completo de flujo Analytics:
  - Carga de datos
  - Interacción con gráficos
  - Filtros temporales
  - Tablas de insights

**Estimación:** 4 horas

---

#### 6.2 Testing de Edge Cases
- [ ] Usuario nuevo sin datos (estados vacíos)
- [ ] Usuario con 1000+ emails
- [ ] Fechas límite (años futuros, formatos raros)
- [ ] Filtros con rangos inválidos
- [ ] API errors (503, timeout)
- [ ] Navegación sin conexión

**Estimación:** 3 horas

---

#### 6.3 Optimización de Rendimiento
- [ ] Implementar `useMemo` en cálculos pesados
- [ ] Lazy loading de componentes de gráficos:
  ```typescript
  const ProductivityHeatmap = lazy(() => import("@/components/analytics/ProductivityHeatmap"));
  ```
- [ ] Optimizar re-renders innecesarios
- [ ] Verificar bundle size (npm run build)
- [ ] Considerar code splitting por ruta

**Estimación:** 3 horas

---

#### 6.4 Responsive Design Final
- [ ] Testing en viewports:
  - Mobile (375px)
  - Tablet (768px)
  - Desktop (1024px, 1440px)
- [ ] Ajustes de layout
- [ ] Touch interactions en mobile
- [ ] Scroll behavior

**Estimación:** 2 horas

---

#### 6.5 Accesibilidad (A11y)
- [ ] Agregar ARIA labels en gráficos
- [ ] Keyboard navigation en modales
- [ ] Focus management
- [ ] Color contrast (WCAG AA)
- [ ] Screen reader testing (opcional)

**Estimación:** 2 horas

---

#### 6.6 Documentación de Código
- [ ] JSDoc en componentes principales
- [ ] README de componentes analytics
- [ ] Comentarios en lógica compleja
- [ ] Actualizar README principal si es necesario

**Estimación:** 1.5 horas

---

#### 6.7 Code Review y Refactoring
- [ ] Revisar código duplicado
- [ ] Extraer helpers comunes
- [ ] Consistencia de naming
- [ ] Limpieza de console.logs
- [ ] TypeScript strict mode compliance

**Estimación:** 2 horas

---

#### 6.8 Testing de Performance
- [ ] Lighthouse audit
- [ ] Core Web Vitals
- [ ] Tiempo de carga de analytics
- [ ] Optimizar imágenes/iconos si aplica

**Estimación:** 1.5 horas

---

#### 6.9 Bug Fixes
- [ ] Resolver bugs encontrados en testing
- [ ] Priorizar critical bugs
- [ ] Log de bugs conocidos (si los hay)

**Estimación:** 3 horas

---

#### 6.10 Preparación para Deploy
- [ ] Build de producción sin errores
- [ ] Verificar variables de entorno
- [ ] Migración de BD (si hubo cambios en schema)
- [ ] Checklist de deploy:
  - [ ] Tests passing
  - [ ] Build successful
  - [ ] No console errors
  - [ ] Responsive OK
  - [ ] Performance OK

**Estimación:** 1 hora

---

### Entregables Sprint 6
- ✅ Testing completo de todas las features
- ✅ Optimización de rendimiento
- ✅ Responsive design validado
- ✅ Accesibilidad mejorada
- ✅ Código documentado
- ✅ Ready para deploy

**Total Estimado:** 23 horas

---

## Resumen General

| Sprint | Objetivo | Duración | Horas Estimadas |
|--------|----------|----------|-----------------|
| Sprint 1 | Fecha de Expiración en DetailPanel | 1 semana | 8.5 horas |
| Sprint 2 | Vista de Emails Procesados - Backend | 2 semanas | 10 horas |
| Sprint 3 | Vista de Emails Procesados - Frontend | 2 semanas | 21 horas |
| Sprint 4 | Vista de Análisis - Fundamentos | 2 semanas | 21.25 horas |
| Sprint 5 | Vista de Análisis - Gráficos Avanzados | 2 semanas | 29 horas |
| Sprint 6 | Testing y Optimización Final | 1 semana | 23 horas |
| **TOTAL** | | **10 semanas** | **112.75 horas** |

---

## Priorización

### Must Have (Crítico)
- ✅ Sprint 1: Fecha de expiración editable
- ✅ Sprint 2-3: Vista de Emails Procesados completa
- ✅ Sprint 4: Analytics básicos (KPIs + 2 gráficos)

### Should Have (Importante)
- Sprint 5: Analytics avanzados (gráficos adicionales)
- Sprint 5: Tablas de insights

### Nice to Have (Opcional)
- Heatmap de productividad
- Export de reportes (futuro)
- Caching avanzado

---

## Dependencias entre Sprints

- Sprint 2 debe completarse antes de Sprint 3
- Sprint 4 debe completarse antes de Sprint 5
- Sprint 6 requiere todos los anteriores completados

**No hay dependencias** entre:
- Sprint 1 y Sprint 2 (pueden ejecutarse en paralelo)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Recharts incompatible con React 19 | Baja | Alto | Usar versión específica, considerar alternativas |
| Performance en analytics con 10k+ emails | Media | Medio | Implementar paginación/limitación temporal |
| Complejidad del heatmap | Media | Bajo | Considerar librería externa o postergar |
| Testing insuficiente | Media | Alto | Dedicar sprint completo a testing (Sprint 6) |

---

## Checklist de Completitud por Sprint

### Sprint 1
- [ ] Fecha de expiración visible en DetailPanel
- [ ] DatePicker funcional y validado
- [ ] API actualizada y testeada
- [ ] Estados de color implementados

### Sprint 2
- [ ] API endpoint `/api/emails/processed` funcional
- [ ] Filtros de fecha y categoría
- [ ] Paginación correcta
- [ ] Tests de API pasando

### Sprint 3
- [ ] Página `/emailsprocesados` renderiza correctamente
- [ ] Filtros funcionales en UI
- [ ] Modal de detalle completo
- [ ] Responsive design verificado

### Sprint 4
- [ ] 4 KPIs mostrando datos correctos
- [ ] Gráfico Donut de distribución
- [ ] Gráfico Bar de prioridades
- [ ] API endpoints respondiendo correctamente

### Sprint 5
- [ ] Timeline chart funcional
- [ ] Emails by category chart funcional
- [ ] Heatmap implementado
- [ ] 2 tablas de insights completas

### Sprint 6
- [ ] Todos los tests E2E pasando
- [ ] Performance metrics aceptables (Lighthouse > 85)
- [ ] Sin errores de consola
- [ ] Ready para producción

---

**Última actualización:** 2025-11-25
**Responsable:** Development Team
**Versión del documento:** 1.0
**Total de Tareas:** 62 tareas principales + subtareas
