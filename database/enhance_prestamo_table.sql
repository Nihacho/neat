-- ============================================================
-- Migration: Enhance prestamo table for better tracking
-- Description: Adds due date and temporary location fields
-- Date: 2025-12-02
-- ============================================================

-- Add fecha_devolucion_esperada column
ALTER TABLE prestamo 
ADD COLUMN fecha_devolucion_esperada TIMESTAMP;

-- Add ubicacion_temporal column (where asset is during loan)
ALTER TABLE prestamo 
ADD COLUMN ubicacion_temporal INT REFERENCES ubicacion(codigo_ubicacion) ON DELETE SET NULL;

-- Add comments
COMMENT ON COLUMN prestamo.fecha_devolucion_esperada IS 'Fecha esperada de devolución del activo';
COMMENT ON COLUMN prestamo.ubicacion_temporal IS 'Ubicación temporal del activo durante el préstamo';

-- ============================================================
-- Notes:
-- - fecha_devolucion_esperada: Used to calculate if loan is overdue
-- - ubicacion_temporal: Tracks where the asset is during the loan
-- - When loan is returned, asset should go back to its original ubicacion_actual
-- - System should auto-update estado_prestamo to 'retraso' if current date > fecha_devolucion_esperada
-- ============================================================
