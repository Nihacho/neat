/**
 * Constantes de niveles de permiso
 */
export const PERMISSION_LEVELS = {
    ADMIN: 1,      // Acceso completo
    READ_ONLY: 2,  // Solo lectura
};

/**
 * Utilidades para manejo de permisos
 */
export const permissionUtils = {
    /**
     * Verifica si el usuario puede crear recursos
     * @param {object} user - Usuario actual
     * @returns {boolean}
     */
    canCreate(user) {
        return user && user.nivel_permiso === PERMISSION_LEVELS.ADMIN;
    },

    /**
     * Verifica si el usuario puede editar recursos
     * @param {object} user - Usuario actual
     * @returns {boolean}
     */
    canEdit(user) {
        return user && user.nivel_permiso === PERMISSION_LEVELS.ADMIN;
    },

    /**
     * Verifica si el usuario puede eliminar recursos
     * @param {object} user - Usuario actual
     * @returns {boolean}
     */
    canDelete(user) {
        return user && user.nivel_permiso === PERMISSION_LEVELS.ADMIN;
    },

    /**
     * Verifica si el usuario puede ver recursos
     * @param {object} user - Usuario actual
     * @returns {boolean}
     */
    canView(user) {
        return user !== null; // Todos los usuarios autenticados pueden ver
    },

    /**
     * Verifica si el usuario es administrador
     * @param {object} user - Usuario actual
     * @returns {boolean}
     */
    isAdmin(user) {
        return user && user.nivel_permiso === PERMISSION_LEVELS.ADMIN;
    },

    /**
     * Verifica si el usuario es solo lectura
     * @param {object} user - Usuario actual
     * @returns {boolean}
     */
    isReadOnly(user) {
        return user && user.nivel_permiso === PERMISSION_LEVELS.READ_ONLY;
    },

    /**
     * Obtiene el nombre del nivel de permiso
     * @param {number} nivel - Nivel de permiso
     * @returns {string}
     */
    getPermissionLevelName(nivel) {
        switch (nivel) {
            case PERMISSION_LEVELS.ADMIN:
                return 'Administrador';
            case PERMISSION_LEVELS.READ_ONLY:
                return 'Solo Lectura';
            default:
                return 'Desconocido';
        }
    },
};
