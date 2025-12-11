# Manual de Aplicación - Gestión de Activos (Neat)

## 1. Introducción
**Gestión de Activos (Neat)** es un sistema integral diseñado para el control eficiente de activos institucionales (Universidad "X"). Permite administrar el ciclo de vida completo de los activos, desde su registro y ubicación hasta su asignación y control de préstamos a docentes, funcionarios y estudiantes.

### Tecnologías Principales
El proyecto está construido sobre un stack moderno y eficiente:
- **Frontend:** React 19 (UI Library)
- **Compilador/Entorno:** Vite (Rápido y ligero)
- **Estilos:** Tailwind CSS 4 (Utility-first CSS)
- **Base de Datos:** Supabase (PostgreSQL as a Service)
- **Estado/Datos:** React Query (TanStack Query)
- **Navegación:** React Router 6+
- **Iconografía:** Lucide React

## 2. Instalación y Configuración

### 2.1 Requisitos Previos
Para ejecutar este proyecto en un entorno local, asegúrese de tener instalado:
- **Node.js**: Versión 20.19+ o 22.12+ (Recomendado).
- **Gestor de paquetes**: npm (incluido con Node.js) o yarn.
- **Cuenta de Supabase**: Para la base de datos y autenticación.

### 2.2 Pasos de Instalación

1.  **Clonar el repositorio:**
    Descargue el código fuente en su máquina local.
    ```bash
    cd ruta/a/tu/carpeta/neat
    ```

2.  **Instalar dependencias:**
    Ejecute el siguiente comando para descargar todas las librerías necesarias listadas en `package.json`.
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Cree un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`). Copie el siguiente formato y reemplace con sus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
    VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
    ```

4.  **Base de Datos (Migraciones):**
    Para que el sistema funcione correctamente, debe ejecutar los scripts SQL proporcionados en su panel de Supabase (SQL Editor).
    Los scripts se encuentran en la carpeta `database/`:
    - `create_usuario_table.sql`: Crea tablas de usuarios y roles.
    - `add_cantidad_to_activo.sql`: Agrega columnas necesarias a la tabla de activos.
    - `enhance_prestamo_table.sql`: Mejora la estructura de préstamos.

5.  **Ejecutar en Desarrollo:**
    Inicie el servidor local para ver la aplicación.
    ```bash
    npm run dev
    ```
    Acceda a través del navegador en: `http://localhost:5173`

6.  **Construcción para Producción:**
    Para generar los archivos optimizados para despliegue:
    ```bash
    npm run build
    ```
    Los archivos se generarán en la carpeta `dist/`.

## 3. Arquitectura del Proyecto

El proyecto sigue una estructura modular y organizada para facilitar la escalabilidad.

### Estructura de Directorios (`src/`)

-   **`assets/`**: Archivos estáticos como imágenes y logotipos.
-   **`components/`**: Componentes de UI reutilizables (Botones, Modales, Badges, Cards). Son "tontos", es decir, solo reciben props y renderizan UI.
-   **`layouts/`**: Estructuras de página principales.
    -   `DashboardLayout.jsx`: Contiene el Sidebar (barra lateral) y el Header, envolviendo el contenido principal.
-   **`pages/`**: Vistas principales de la aplicación. Cada archivo corresponde a una ruta.
    -   `DashboardPage.jsx`: Panel de control principal.
    -   `AssetsPage.jsx`: Gestión de inventario.
    -   `PersonasPage.jsx`: Gestión de personal y usuarios.
    -   `PrestamosPage.jsx`: Control de préstamos.
    -   `UsuariosPage.jsx`: Administración de usuarios del sistema.
    -   `ReportesPage.jsx`: Visualización de reportes.
-   **`features/`**: Lógica de negocio agrupada por dominio.
    -   `auth/`: Contexto de autenticación y lógica de login.
    -   `assets/`: Hooks y servicios específicos para activos.
    -   `loans/`: Lógica para préstamos.
    -   `users/`: Gestión de usuarios.
-   **`lib/`**: Utilidades y configuraciones globales.
    -   `supabase.js`: Cliente de conexión a Supabase. Initialize.

## 4. Base de Datos (Esquema)

El sistema utiliza **PostgreSQL** a través de Supabase.

### Tablas Principales
-   **`activos`**: Almacena la información de los bienes (nombre, código, estado, ubicación, etc.).
-   **`personas`**: Registro de individuos que pueden solicitar préstamos (Estudiantes, Docentes, Funcionarios).
-   **`ubicaciones`**: Lugares físicos donde pueden residir los activos.
-   **`prestamos`**: Registro de transacciones de préstamo, vinculando un `activo` con una `persona`.
-   **`users`** (Sistema): Tabla personalizada para gestionar roles de acceso a la aplicación (Admin, Operador, etc.).

## 5. Seguridad y Permisos
-   **Autenticación**: Se maneja a través de Supabase Auth.
-   **Protección de Rutas**: Las rutas están protegidas para que solo usuarios autenticados puedan acceder al Dashboard.
-   **Roles**: El sistema está preparado para diferenciar entre roles (ej. Administrador vs. Usuario de consulta), controlado en la tabla de usuarios.

## 6. Solución de Problemas Comunes

-   **Error de Conexión:** Verifique que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` sean correctos y que su proyecto en Supabase no esté pausado.
-   **Pantalla en Blanco:** Revise la consola del navegador (F12) para ver errores de JavaScript. Comúnmente puede ser por falta de datos en una tabla obligatoria.
-   **Errores de Estilos:** Si Tailwind no carga, asegúrese de que el archivo `index.css` importa las directivas de tailwind correctamente.
