/**
 * @typedef {'docente' | 'funcionario' | 'estudiante'} TipoPersona
 * @typedef {'nuevo' | 'usado' | 'dañado' | 'en_reparacion'} EstadoActivo
 * @typedef {'mueble' | 'audio' | 'computacion' | 'herramienta' | 'otro'} CategoriaActivo
 * @typedef {'pendiente' | 'devuelto' | 'retraso'} EstadoPrestamo
 */

/**
 * @typedef {Object} Persona
 * @property {string} carnet - PK
 * @property {string} nombre
 * @property {string} [telefono]
 * @property {string} [correo]
 * @property {TipoPersona} tipo_persona
 */

/**
 * @typedef {Object} Docente
 * @property {string} carnet - FK Persona
 * @property {string} [especialidad]
 * @property {string} [departamento]
 * @property {string} [grado_academico]
 */

/**
 * @typedef {Object} Funcionario
 * @property {string} carnet - FK Persona
 * @property {string} [cargo]
 * @property {string} [area_trabajo]
 * @property {number} [nivel_permiso]
 */

/**
 * @typedef {Object} Estudiante
 * @property {string} carnet - FK Persona
 * @property {string} [carrera]
 * @property {number} [semestre]
 * @property {string} [ru]
 */

/**
 * @typedef {Object} Ubicacion
 * @property {number} codigo_ubicacion - PK
 * @property {string} nombre_ambiente
 * @property {string} [piso]
 * @property {string} [bloque]
 */

/**
 * @typedef {Object} Activo
 * @property {number} codigo_activo - PK
 * @property {string} nombre
 * @property {string} [descripcion]
 * @property {EstadoActivo} estado
 * @property {CategoriaActivo} categoria
 * @property {string} fecha_registro - ISO Date
 * @property {number} [ubicacion_actual] - FK Ubicacion
 */

/**
 * @typedef {Object} Prestamo
 * @property {number} codigo_prestamo - PK
 * @property {number} codigo_activo - FK Activo
 * @property {string} carnet_persona - FK Persona
 * @property {string} fecha_prestamo - ISO Date
 * @property {string} [fecha_devolucion] - ISO Date
 * @property {EstadoPrestamo} estado_prestamo
 */

/**
 * @typedef {Object} Movimiento
 * @property {number} codigo_movimiento - PK
 * @property {number} codigo_activo - FK Activo
 * @property {number} [ubicacion_anterior] - FK Ubicacion
 * @property {number} [ubicacion_nueva] - FK Ubicacion
 * @property {string} fecha_movimiento - ISO Date
 * @property {string} [motivo]
 */

export const TYPES = {} // Export empty object to make it a module
