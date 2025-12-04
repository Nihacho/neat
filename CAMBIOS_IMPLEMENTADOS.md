# Instrucciones de Migración - Nuevas Funcionalidades

## Cambios Implementados

### 1. ✅ Corrección del Módulo de Préstamos
- Corregida la lógica de cantidad en préstamos
- Ahora crea múltiples préstamos individuales cuando se presta más de 1 unidad
- Validación de cantidades disponibles antes de crear el préstamo
- Decremento correcto del inventario de activos

### 2. ✅ Nueva Página de Reportes
- Reportes por Persona: Ver historial de préstamos de una persona específica
- Reportes por Activo: Ver historial de préstamos de un activo específico
- Filtros por rango de fechas
- Estadísticas: Total, Pendientes, Devueltos, Con Retraso
- Exportación a CSV
- Ruta: `/reportes`

### 3. ✅ Nueva Página de Control de Usuarios
- CRUD completo de usuarios
- Campos: username, password, nombre_completo, rol (admin/usuario), activo
- Búsqueda de usuarios
- Gestión de roles y estados
- Ruta: `/usuarios`

## Pasos para Aplicar los Cambios

### 1. Ejecutar Migración de Base de Datos

Abre el **SQL Editor** en Supabase y ejecuta el siguiente script:

```sql
-- Archivo: database/create_usuario_table.sql
```

Copia y pega el contenido del archivo `database/create_usuario_table.sql` en el SQL Editor de Supabase y ejecútalo.

Esto creará:
- Tabla `usuario` con todos los campos necesarios
- Usuario administrador por defecto:
  - Username: `admin`
  - Password: `admin123`
  - Rol: `admin`

### 2. Verificar las Tablas

Asegúrate de que las siguientes tablas existan en tu base de datos:
- ✅ `activo`
- ✅ `persona`
- ✅ `ubicacion`
- ✅ `prestamo` (con columnas `fecha_devolucion_esperada` y `ubicacion_temporal`)
- ✅ `usuario` (nueva)

### 3. Reiniciar el Servidor de Desarrollo

```bash
npm run dev
```

## Nuevas Rutas Disponibles

1. **Dashboard**: `/` - Panel de control principal
2. **Activos**: `/activos` - Gestión de activos
3. **Personas**: `/personas` - Gestión de personas
4. **Préstamos**: `/prestamos` - Gestión de préstamos (CORREGIDO)
5. **Ubicaciones**: `/ubicaciones` - Gestión de ubicaciones
6. **Reportes**: `/reportes` - Reportes por persona y activo (NUEVO)
7. **Usuarios**: `/usuarios` - Control de usuarios (NUEVO)

## Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

⚠️ **IMPORTANTE**: Cambia la contraseña del administrador después del primer login en producción.

## Notas de Seguridad

1. Las contraseñas actualmente se almacenan en texto plano
2. En producción, implementar:
   - Hash de contraseñas con bcrypt o argon2
   - Autenticación JWT o similar
   - Protección de rutas según rol
   - HTTPS obligatorio

## Funcionalidades de Reportes

### Reporte por Persona
1. Selecciona "Por Persona"
2. Elige una persona del dropdown
3. Opcionalmente, filtra por rango de fechas
4. Ver estadísticas y tabla de préstamos
5. Exportar a CSV si es necesario

### Reporte por Activo
1. Selecciona "Por Activo"
2. Elige un activo del dropdown
3. Opcionalmente, filtra por rango de fechas
4. Ver estadísticas y tabla de préstamos
5. Exportar a CSV si es necesario

## Funcionalidades de Usuarios

### Crear Usuario
1. Click en "Nuevo Usuario"
2. Llenar formulario (username, password, nombre completo, rol)
3. Marcar si está activo
4. Guardar

### Editar Usuario
1. Click en el botón de editar (lápiz)
2. Modificar campos necesarios
3. Dejar password vacío si no se quiere cambiar
4. Guardar

### Eliminar Usuario
1. Click en el botón de eliminar (papelera)
2. Confirmar eliminación

## Solución de Problemas

### Error: "relation 'usuario' does not exist"
- Ejecuta el script SQL `create_usuario_table.sql` en Supabase

### Los préstamos no se crean correctamente
- Verifica que la tabla `prestamo` tenga las columnas `fecha_devolucion_esperada` y `ubicacion_temporal`
- Ejecuta el script `enhance_prestamo_table.sql` si no existen

### No aparecen las nuevas opciones en el menú
- Verifica que el servidor esté corriendo
- Limpia la caché del navegador (Ctrl + Shift + R)
- Verifica que no haya errores en la consola del navegador

## Próximas Mejoras Sugeridas

- [ ] Implementar autenticación real con JWT
- [ ] Hash de contraseñas con bcrypt
- [ ] Protección de rutas por rol
- [ ] Logs de auditoría
- [ ] Notificaciones de préstamos vencidos
- [ ] Dashboard con más métricas
- [ ] Exportación de reportes en PDF
