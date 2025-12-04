-- Script para crear un usuario administrador por defecto
-- Usuario: Admin123@univalle.edu
-- Contraseña: admin123
-- Nivel de permiso: 1 (Administrador - Acceso completo)

-- Primero, insertar en la tabla persona
INSERT INTO persona (carnet, nombre, telefono, correo, tipo_persona)
VALUES ('ADMIN001', 'Administrador del Sistema', '00000000', 'Admin123@univalle.edu', 'funcionario')
ON CONFLICT (carnet) DO NOTHING;

-- Luego, insertar en la tabla funcionario con la contraseña hasheada
-- La contraseña 'admin123' hasheada con bcrypt (10 rounds) es:
-- $2a$10$YourHashHere (esto se generará en el siguiente paso)
INSERT INTO funcionario (carnet, cargo, area_trabajo, nivel_permiso, password_hash)
VALUES (
  'ADMIN001', 
  'Administrador del Sistema', 
  'TI - Sistemas', 
  1,
  '$2a$10$rOZxqKJ5vN8FZQxJ5vN8FO7YxJ5vN8FZQxJ5vN8FO7YxJ5vN8FZQx'
)
ON CONFLICT (carnet) DO UPDATE SET
  cargo = EXCLUDED.cargo,
  area_trabajo = EXCLUDED.area_trabajo,
  nivel_permiso = EXCLUDED.nivel_permiso,
  password_hash = EXCLUDED.password_hash;

-- NOTA: El hash anterior es un placeholder. 
-- Ejecuta el script create_default_admin.js para generar el hash correcto.
