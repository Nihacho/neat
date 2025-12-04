-- ============================================================
-- Migration: Add cantidad field to activo table
-- Description: Adds a quantity field to track multiple units of the same asset
-- Date: 2025-12-02
-- ============================================================

-- Add cantidad column to activo table
ALTER TABLE activo 
ADD COLUMN cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad >= 0);

-- Add comment to the column
COMMENT ON COLUMN activo.cantidad IS 'Cantidad de unidades disponibles de este activo';

-- Update existing records to have cantidad = 1
UPDATE activo SET cantidad = 1 WHERE cantidad IS NULL;

-- ============================================================
-- Notes:
-- - This field will be used to track inventory quantities
-- - When creating a préstamo, the system should check if cantidad > 0
-- - When a préstamo is created, cantidad should be decremented
-- - When a préstamo is returned, cantidad should be incremented
-- ============================================================
