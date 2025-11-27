import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { useCreateAsset } from '../hooks';

export function AssetForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'mueble',
    estado: 'nuevo',
    ubicacion_actual: null,
    cantidad: 1
  });

  const createAsset = useCreateAsset();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAsset.mutateAsync(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Error al crear activo: ' + error.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="Ej: Silla ergonómica"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          rows="3"
          placeholder="Descripción detallada del activo..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="mueble">Mueble</option>
            <option value="audio">Audio</option>
            <option value="computacion">Computación</option>
            <option value="herramienta">Herramienta</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="dañado">Dañado</option>
            <option value="en_reparacion">En Reparación</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          required
          min="1"
          value={formData.cantidad}
          onChange={(e) => handleChange('cantidad', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="1"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={createAsset.isPending}>
          Guardar Activo
        </Button>
      </div>
    </form>
  );
}
