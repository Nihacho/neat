# Sistema de Control de Activos Institucionales

Sistema completo de gestión de activos para la Universidad "X" desarrollado con React, Vite, TailwindCSS y Supabase.

## 🚀 Características

- ✅ **Gestión de Ubicaciones** - CRUD completo para ambientes, bloques y pisos
- ✅ **Gestión de Personas** - CRUD para Docentes, Funcionarios y Estudiantes
- ✅ **Dashboard en Tiempo Real** - Estadísticas y visualizaciones actualizadas
- ✅ **Gestión de Activos** - Control de inventario con cantidad
- ✅ **Sistema de Préstamos** - Control de préstamos y devoluciones
- ✅ **Diseño Profesional** - UI moderna con gradientes y animaciones

## 🎨 Tecnologías

- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **TailwindCSS 4** - Framework de estilos
- **Supabase** - Base de datos PostgreSQL
- **React Query** - Gestión de estado del servidor
- **React Router** - Navegación
- **Lucide React** - Iconos

## 📋 Requisitos Previos

- Node.js 20.19+ o 22.12+
- npm o yarn
- Cuenta de Supabase

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
cd c:\Users\usuariocc\Desktop\Web\neat
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Aplicar migración de base de datos

Ejecuta el script SQL en Supabase SQL Editor:

```bash
database/add_cantidad_to_activo.sql
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
neat/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Modal.jsx
│   ├── layouts/          # Layouts de la aplicación
│   │   ├── DashboardLayout.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── pages/            # Páginas principales
│   │   ├── DashboardPage.jsx
│   │   ├── UbicacionesPage.jsx
│   │   ├── PersonasPage.jsx
│   │   ├── AssetsPage.jsx
│   │   └── PrestamosPage.jsx
│   ├── lib/              # Utilidades
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── database/             # Scripts SQL
│   └── add_cantidad_to_activo.sql
└── package.json
```

## 🎯 Módulos Implementados

### Dashboard
- Estadísticas en tiempo real
- Gráficos de distribución por categoría
- Actividad reciente de préstamos
- Estados de activos

### Ubicaciones
- Crear, editar y eliminar ubicaciones
- Búsqueda en tiempo real
- Vista en tarjetas con información detallada

### Personas
- Gestión de Docentes, Funcionarios y Estudiantes
- Formularios dinámicos según tipo
- Filtrado por tipo de persona
- Vista en tabla profesional

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter

## 🎨 Paleta de Colores

- **Primary**: Indigo (#6366f1)
- **Secondary**: Purple (#a855f7)
- **Success**: Green
- **Danger**: Red
- **Warning**: Yellow

## 📝 Próximas Funcionalidades

- [ ] Control de cantidad en préstamos
- [ ] Reportes y exportación de datos
- [ ] Sistema de notificaciones
- [ ] Historial de movimientos
- [ ] Búsqueda avanzada con filtros múltiples

## 🐛 Solución de Problemas

### Error de conexión a Supabase

Verifica que las variables de entorno estén correctamente configuradas en el archivo `.env`

### Puerto en uso

Si el puerto 5173 está en uso, Vite automáticamente usará el siguiente disponible (5174, 5175, etc.)

### Node.js version warning

Actualiza Node.js a la versión 20.19+ o 22.12+ para mejor compatibilidad

## 📄 Licencia

Este proyecto es parte del sistema de gestión de la Universidad "X"

## 👥 Contacto

Para soporte o consultas sobre el sistema, contacta al equipo de desarrollo.
