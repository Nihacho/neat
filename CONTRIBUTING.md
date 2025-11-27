# Guía de Desarrollo para Colaboradores
## Sistema de Control de Activos Institucionales

Esta guía está diseñada para que tus compañeros puedan completar las funcionalidades pendientes del sistema. Cada sección incluye instrucciones técnicas detalladas.

---

## 📋 Antes de Empezar

### Configuración Inicial
1. Clona el repositorio y ejecuta `npm install`
2. Crea el archivo `.env` con las credenciales de Supabase
3. Ejecuta `npm run dev` para iniciar el servidor local

### Estructura del Proyecto
```
src/
├── features/          # Módulos del negocio (cada módulo es independiente)
│   ├── assets/       # Ya implementado (referencia)
│   ├── loans/        # Por implementar
│   ├── users/        # Por implementar
│   └── locations/    # Por implementar
├── components/       # Componentes UI reutilizables (Button, Card, Badge)
├── pages/           # Páginas principales
└── lib/             # Configuración (Supabase)
```

---

## 🔌 TAREA 1: Conexión a Base de Datos

**Responsable sugerido:** Líder técnico o persona con acceso a Supabase

### Pasos:
1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar el proyecto
3. Settings → API
4. Copiar:
   - `Project URL` (ej: https://xxxxx.supabase.co)
   - `anon public` key (una cadena larga)
5. Crear archivo `.env` en la raíz:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_aqui
   ```
6. Reiniciar el servidor (`npm run dev`)
7. Verificar en la consola del navegador que no aparezca el warning "Missing Supabase Key"

---

## 📦 TAREA 2: Formulario de Activos

**Responsable sugerido:** Desarrollador con experiencia en formularios React

### Archivos a crear/modificar:
- `src/features/assets/components/AssetForm.jsx` (NUEVO)
- `src/pages/AssetsPage.jsx` (MODIFICAR)

### Paso 1: Crear el Formulario
Crea `src/features/assets/components/AssetForm.jsx`:

```javascript
import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { useCreateAsset } from '../hooks';

export function AssetForm({ onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'mueble',
    estado: 'nuevo',
    ubicacion_actual: null
  });

  const createAsset = useCreateAsset();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAsset.mutateAsync(formData);
      alert('Activo creado exitosamente');
      onClose();
    } catch (error) {
      alert('Error al crear activo: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoría *</label>
        <select
          value={formData.categoria}
          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="mueble">Mueble</option>
          <option value="audio">Audio</option>
          <option value="computacion">Computación</option>
          <option value="herramienta">Herramienta</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado *</label>
        <select
          value={formData.estado}
          onChange={(e) => setFormData({...formData, estado: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
          <option value="dañado">Dañado</option>
          <option value="en_reparacion">En Reparación</option>
        </select>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={createAsset.isPending}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
```

### Paso 2: Agregar Modal a la Página
Modifica `src/pages/AssetsPage.jsx` para incluir el formulario en un modal. Necesitarás crear un componente Modal básico o usar el formulario en una sección expandible.

---

## 👥 TAREA 3: Módulo de Personas

**Responsable sugerido:** Desarrollador intermedio

### Archivos a crear:
1. `src/features/users/services.js`
2. `src/features/users/hooks.js`
3. `src/features/users/components/UserTable.jsx`
4. `src/features/users/components/UserForm.jsx`
5. `src/pages/PersonasPage.jsx` (MODIFICAR)

### Paso 1: Servicio de Personas
Crea `src/features/users/services.js`:

```javascript
import { supabase } from '../../lib/supabase';

export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(persona) {
    const { data, error } = await supabase
      .from('persona')
      .insert([persona])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

### Paso 2: Hooks
Crea `src/features/users/hooks.js`:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from './services';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Paso 3: Tabla de Personas
Crea `src/features/users/components/UserTable.jsx` siguiendo el patrón de `AssetTable.jsx`.

### Paso 4: Formulario con Campos Dinámicos
El formulario debe mostrar campos diferentes según el tipo de persona:
- **Docente**: especialidad, departamento, grado_academico
- **Funcionario**: cargo, area_trabajo, nivel_permiso
- **Estudiante**: carrera, semestre, ru

---

## 📍 TAREA 4: Módulo de Ubicaciones

**Responsable sugerido:** Desarrollador junior (tarea más sencilla)

### Archivos a crear:
1. `src/features/locations/services.js`
2. `src/features/locations/hooks.js`
3. `src/features/locations/components/LocationTable.jsx`
4. `src/features/locations/components/LocationForm.jsx`
5. `src/pages/UbicacionesPage.jsx` (MODIFICAR)

### Estructura del Servicio
```javascript
export const locationService = {
  async getAll() {
    const { data, error } = await supabase
      .from('ubicacion')
      .select('*')
      .order('nombre_ambiente', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(ubicacion) {
    const { data, error } = await supabase
      .from('ubicacion')
      .insert([ubicacion])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

**Campos del formulario:** nombre_ambiente, piso, bloque

---

## 🤝 TAREA 5: Módulo de Préstamos

**Responsable sugerido:** Desarrollador senior (tarea compleja)

### Archivos a crear:
1. `src/features/loans/services.js`
2. `src/features/loans/hooks.js`
3. `src/features/loans/components/LoanTable.jsx`
4. `src/features/loans/components/LoanForm.jsx`
5. `src/pages/PrestamosPage.jsx` (MODIFICAR)

### Lógica Importante:
1. **Al crear un préstamo:**
   - Verificar que el activo esté disponible (no prestado)
   - Registrar en tabla `prestamo`
   - Cambiar estado del activo si es necesario

2. **Al devolver:**
   - Actualizar `fecha_devolucion` en la tabla `prestamo`
   - Cambiar `estado_prestamo` a 'devuelto'
   - Liberar el activo

### Servicio de Préstamos
```javascript
export const loanService = {
  async getActive() {
    const { data, error } = await supabase
      .from('prestamo')
      .select(`
        *,
        activo:codigo_activo (nombre, codigo_activo),
        persona:carnet_persona (nombre, carnet)
      `)
      .eq('estado_prestamo', 'pendiente')
      .order('fecha_prestamo', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(loan) {
    const { data, error } = await supabase
      .from('prestamo')
      .insert([{
        ...loan,
        fecha_prestamo: new Date().toISOString(),
        estado_prestamo: 'pendiente'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async returnLoan(codigo_prestamo) {
    const { data, error } = await supabase
      .from('prestamo')
      .update({
        fecha_devolucion: new Date().toISOString(),
        estado_prestamo: 'devuelto'
      })
      .eq('codigo_prestamo', codigo_prestamo)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

---

## 🚀 TAREA 6: Despliegue (Opcional)

**Responsable sugerido:** DevOps o líder técnico

### Opción A: Vercel (Recomendado)
1. Ir a [vercel.com](https://vercel.com)
2. Conectar con GitHub
3. Importar el repositorio
4. Agregar las variables de entorno (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
5. Deploy automático

### Opción B: Netlify
Similar a Vercel, pero en [netlify.com](https://netlify.com)

---

## 📝 Consejos Generales

1. **Sigue el patrón existente:** Revisa cómo está implementado el módulo de Activos y replica la estructura.
2. **Usa los componentes existentes:** Button, Card, Badge ya están listos.
3. **Prueba en local primero:** Antes de hacer commit, verifica que todo funcione.
4. **Commits descriptivos:** Usa mensajes claros (ej: "feat: agregar formulario de personas").
5. **Pide ayuda:** Si algo no funciona, revisa la consola del navegador para ver errores.

---

## 🆘 Solución de Problemas Comunes

### Error: "Cannot resolve import"
- Verifica que la ruta de importación sea correcta
- Asegúrate de que el archivo exista

### Error: "Missing Supabase Key"
- Revisa que el archivo `.env` exista
- Reinicia el servidor después de crear el `.env`

### Error en Supabase: "permission denied"
- Verifica las políticas RLS en Supabase
- Puede que necesites configurar permisos en la base de datos

---

## ✅ Checklist de Entrega

Antes de marcar una tarea como completa, verifica:
- [ ] El código compila sin errores (`npm run build`)
- [ ] La funcionalidad funciona en el navegador
- [ ] Los datos se guardan correctamente en Supabase
- [ ] El código sigue el estilo del proyecto
- [ ] Se hizo commit y push a GitHub
