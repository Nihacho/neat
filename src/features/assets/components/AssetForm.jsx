import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/Button';
import { useCreateAsset, useUpdateAsset } from '../hooks';
import { supabase } from '../../../lib/supabase';

export function AssetForm({ asset, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'mueble',
    estado: 'nuevo',
    ubicacion_actual: null,
    cantidad: 1
  });

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const isEditing = !!asset;

  // Fetch ubicaciones
  const { data: ubicaciones = [] } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ubicacion')
        .select('*')
        .order('nombre_ambiente', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        nombre: asset.nombre || '',
        descripcion: asset.descripcion || '',
        categoria: asset.categoria || 'mueble',
        estado: asset.estado || 'nuevo',
        ubicacion_actual: asset.ubicacion_actual || null,
        cantidad: asset.cantidad || 1
      });
    }
  }, [asset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        ubicacion_actual: formData.ubicacion_actual ? parseInt(formData.ubicacion_actual) : null
      };

      if (isEditing) {
        await updateAsset.mutateAsync({
          id: asset.codigo_activo,
          updates: dataToSave
        });
      } else {
        await createAsset.mutateAsync(dataToSave);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Error al guardar activo: ' + error.message);
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all resize-none"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
          >
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="dañado">Dañado</option>
            <option value="en_reparacion">En Reparación</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <select
            value={formData.ubicacion_actual || ''}
            onChange={(e) => handleChange('ubicacion_actual', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
          >
            <option value="">Sin ubicación</option>
            {ubicaciones.map((ub) => (
              <option key={ub.codigo_ubicacion} value={ub.codigo_ubicacion}>
                {ub.nombre_ambiente} {ub.bloque ? `- Bloque ${ub.bloque}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={createAsset.isPending || updateAsset.isPending}
        >
          {isEditing ? 'Actualizar Activo' : 'Guardar Activo'}
        </Button>
      </div>
    </form>
  );
}
