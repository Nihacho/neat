-- ============================================================
-- Migration: Create usuario table for user management
-- Description: Adds user authentication and authorization
-- Date: 2025-12-04
-- ============================================================

-- Create usuario table
CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comments
COMMENT ON TABLE usuario IS 'Usuarios del sistema con autenticación';
COMMENT ON COLUMN usuario.username IS 'Nombre de usuario único para login';
COMMENT ON COLUMN usuario.password IS 'Contraseña encriptada del usuario';
COMMENT ON COLUMN usuario.nombre_completo IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuario.rol IS 'Rol del usuario: admin o usuario';
COMMENT ON COLUMN usuario.activo IS 'Estado del usuario (activo/inactivo)';

-- Create index on username for faster lookups
CREATE INDEX idx_usuario_username ON usuario(username);

-- Insert default admin user (password: admin123)
-- NOTE: In production, use proper password hashing (bcrypt, argon2, etc.)
INSERT INTO usuario (username, password, nombre_completo, rol, activo) 
VALUES ('admin', 'admin123', 'Administrador del Sistema', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- Notes:
-- - Password should be hashed in production using bcrypt or similar
-- - Consider adding last_login timestamp
-- - Consider adding failed_login_attempts for security
-- - Consider adding email field for password recovery
-- ============================================================
