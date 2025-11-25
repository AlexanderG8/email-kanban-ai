# API Endpoint: GET /api/emails/processed

## Descripcion
Obtiene la lista de emails procesados con capacidades de filtrado y paginacion.

## Autenticacion
Requiere usuario autenticado (NextAuth session).

## Query Parameters

| Parametro | Tipo | Requerido | Default | Descripcion |
|-----------|------|-----------|---------|-------------|
| `startDate` | string (ISO8601) | No | - | Fecha de inicio del rango |
| `endDate` | string (ISO8601) | No | - | Fecha de fin del rango |
| `category` | string | No | - | Categoria del email: "Cliente", "Lead", "Interno", o "Todas" |
| `page` | number | No | 1 | Numero de pagina (minimo: 1) |
| `limit` | number | No | 50 | Cantidad de resultados por pagina (minimo: 1, maximo: 100) |

## Respuesta Exitosa (200)

```json
{
  "emails": [
    {
      "id": "clx123...",
      "userId": "user123",
      "gmailId": "gmail123",
      "senderId": "sender@example.com",
      "senderName": "John Doe",
      "subject": "Reunion importante",
      "body": "<p>Contenido del email...</p>",
      "snippet": "Contenido del email...",
      "category": "Cliente",
      "receivedAt": "2025-11-25T10:00:00.000Z",
      "hasTask": true,
      "createdAt": "2025-11-25T10:05:00.000Z",
      "tasks": [
        {
          "id": "task123",
          "title": "Preparar reunion",
          "status": "Pendiente",
          "priority": "Alta",
          "dueDate": "2025-11-26T10:00:00.000Z"
        }
      ]
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

## Errores

### 401 Unauthorized
```json
{
  "error": "No autorizado"
}
```

### 400 Bad Request
```json
{
  "error": "Parametros de paginacion invalidos"
}
```

```json
{
  "error": "Formato de fecha invalido"
}
```

```json
{
  "error": "La fecha de inicio debe ser menor o igual a la fecha de fin"
}
```

```json
{
  "error": "Categoria invalida"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor"
}
```

## Ejemplos de Uso

### 1. Obtener todos los emails (primera pagina)
```
GET /api/emails/processed
```

### 2. Obtener emails con paginacion
```
GET /api/emails/processed?page=2&limit=20
```

### 3. Filtrar por categoria
```
GET /api/emails/processed?category=Cliente
```

### 4. Filtrar por rango de fechas
```
GET /api/emails/processed?startDate=2025-11-01T00:00:00.000Z&endDate=2025-11-30T23:59:59.999Z
```

### 5. Combinacion de filtros
```
GET /api/emails/processed?category=Lead&startDate=2025-11-01T00:00:00.000Z&endDate=2025-11-30T23:59:59.999Z&page=1&limit=25
```

## Notas de Implementacion

### Indices de Base de Datos
El endpoint utiliza los siguientes indices para optimizar las queries:
- `[userId, category]` - Para filtrado por usuario y categoria
- `[userId, receivedAt]` - Para filtrado por usuario y fecha
- `[senderId]` - Para busqueda por remitente

### Eager Loading
Los emails incluyen las tareas relacionadas mediante `include`:
```typescript
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
}
```

### Performance
- Las queries de conteo y busqueda se ejecutan en paralelo usando `Promise.all()`
- Los resultados estan ordenados por fecha de recepcion (descendente)
- Limite maximo de 100 resultados por pagina para evitar sobrecarga

## Testing

### Con curl:
```bash
# Sin autenticacion (debe fallar con 401)
curl http://localhost:3000/api/emails/processed

# Con filtros (requiere autenticacion)
curl http://localhost:3000/api/emails/processed?category=Cliente&page=1&limit=10 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Con Thunder Client / Postman:
1. Autenticarse primero en la aplicacion
2. Copiar la cookie de sesion
3. Hacer request GET a `/api/emails/processed` con los query params deseados
