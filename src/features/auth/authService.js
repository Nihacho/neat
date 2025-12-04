import { supabase } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

/**
 * Servicio de autenticación basado en la tabla funcionario
 */
export const authService = {
  /**
   * Autentica un funcionario usando correo y contraseña
   * @param {string} correo - Correo electrónico del funcionario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<{user: object, error: null} | {user: null, error: string}>}
   */
  async login(correo, password) {
    try {
      // Buscar persona por correo que sea funcionario
      const { data: persona, error: personaError } = await supabase
        .from('persona')
        .select('carnet, nombre, correo, tipo_persona')
        .eq('correo', correo)
        .eq('tipo_persona', 'funcionario')
        .single();

      if (personaError || !persona) {
        return { user: null, error: 'Credenciales inválidas' };
      }

      // Obtener datos del funcionario incluyendo password_hash
      const { data: funcionario, error: funcionarioError } = await supabase
        .from('funcionario')
        .select('carnet, cargo, area_trabajo, nivel_permiso, password_hash')
        .eq('carnet', persona.carnet)
        .single();

      if (funcionarioError || !funcionario) {
        return { user: null, error: 'Credenciales inválidas' };
      }

      // Verificar que tenga contraseña configurada
      if (!funcionario.password_hash) {
        return { user: null, error: 'Usuario sin contraseña configurada. Contacte al administrador.' };
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, funcionario.password_hash);
      
      if (!isPasswordValid) {
        return { user: null, error: 'Credenciales inválidas' };
      }

      // Construir objeto de usuario
      const user = {
        carnet: persona.carnet,
        nombre: persona.nombre,
        correo: persona.correo,
        cargo: funcionario.cargo,
        area_trabajo: funcionario.area_trabajo,
        nivel_permiso: funcionario.nivel_permiso,
      };

      // Guardar en localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { user, error: null };
    } catch (error) {
      console.error('Error en login:', error);
      return { user: null, error: 'Error al iniciar sesión. Intente nuevamente.' };
    }
  },

  /**
   * Cierra la sesión del usuario actual
   */
  logout() {
    localStorage.removeItem('currentUser');
  },

  /**
   * Obtiene el usuario actual desde localStorage
   * @returns {object|null}
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  /**
   * Genera un hash de contraseña usando bcrypt
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash de la contraseña
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  /**
   * Verifica si el usuario tiene un nivel de permiso específico o superior
   * @param {number} requiredLevel - Nivel de permiso requerido
   * @returns {boolean}
   */
  hasPermission(requiredLevel) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Nivel 1 tiene todos los permisos
    // Nivel 2 solo tiene permisos de lectura
    return user.nivel_permiso <= requiredLevel;
  }
};
