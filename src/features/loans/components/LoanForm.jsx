import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/Button';
import { X, Plus, MapPin } from 'lucide-react';
import { useCreateLoan } from '../hooks';
import { supabase } from '../../../lib/supabase';

export function LoanForm({ onClose, onSuccess }) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [formData, setFormData] = useState({
    carnet_persona: '',
    fecha_devolucion_esperada: '',
    ubicacion_temporal: '',
  });

  const createLoan = useCreateLoan();

  // Fetch available assets
  const { data: assets = [] } = useQuery({
    queryKey: ['available-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activo')
        .select(`
          *,
          ubicacion:ubicacion_actual(codigo_ubicacion, nombre_ambiente, bloque)
        `)
        .gt('cantidad', 0)
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch personas
  const { data: personas = [] } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

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

  const handleAddAsset = (assetId, quantity = 1) => {
    const asset = assets.find(a => a.codigo_activo === parseInt(assetId));
    if (asset) {
      const existingIndex = selectedAssets.findIndex(a => a.codigo_activo === asset.codigo_activo);
      if (existingIndex >= 0) {
        // Update quantity
        const updated = [...selectedAssets];
        updated[existingIndex] = { ...updated[existingIndex], cantidadPrestada: quantity };
        setSelectedAssets(updated);
      } else {
        // Add new
        setSelectedAssets([...selectedAssets, { ...asset, cantidadPrestada: quantity }]);
      }
    }
  };

  const handleRemoveAsset = (assetId) => {
    setSelectedAssets(selectedAssets.filter(a => a.codigo_activo !== assetId));
  };

  const handleQuantityChange = (assetId, quantity) => {
    const updated = selectedAssets.map(a =>
      a.codigo_activo === assetId ? { ...a, cantidadPrestada: parseInt(quantity) || 1 } : a
    );
    setSelectedAssets(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedAssets.length === 0) {
      alert('Debes seleccionar al menos un activo');
      return;
    }

    if (!formData.carnet_persona) {
      alert('Debes seleccionar una persona');
      return;
    }

    try {
      // Validate quantities
      for (const asset of selectedAssets) {
        if (asset.cantidadPrestada > asset.cantidad) {
          alert(`La cantidad a prestar de "${asset.nombre}" excede la cantidad disponible (${asset.cantidad})`);
          return;
        }
        if (asset.cantidadPrestada <= 0) {
          alert(`La cantidad a prestar de "${asset.nombre}" debe ser mayor a 0`);
          return;
        }
      }

      // Create loans for each asset
      for (const asset of selectedAssets) {
        // Create multiple loans if quantity > 1
        for (let i = 0; i < asset.cantidadPrestada; i++) {
          const loanData = {
            codigo_activo: asset.codigo_activo,
            carnet_persona: formData.carnet_persona,
          };

          // Only add optional fields if they have values
          if (formData.fecha_devolucion_esperada) {
            loanData.fecha_devolucion_esperada = formData.fecha_devolucion_esperada;
          }
          if (formData.ubicacion_temporal) {
            loanData.ubicacion_temporal = parseInt(formData.ubicacion_temporal);
          }

          // Create the loan
          await createLoan.mutateAsync(loanData);
        }

        // Decrease the asset quantity
        const newQuantity = asset.cantidad - asset.cantidadPrestada;
        await supabase
          .from('activo')
          .update({ cantidad: newQuantity })
          .eq('codigo_activo', asset.codigo_activo);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Error al crear préstamo: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Persona Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Persona <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.carnet_persona}
          onChange={(e) => setFormData({ ...formData, carnet_persona: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
        >
          <option value="">Seleccionar persona...</option>
          {personas.map((persona) => (
            <option key={persona.carnet} value={persona.carnet}>
              {persona.nombre} - {persona.carnet} ({persona.tipo_persona})
            </option>
          ))}
        </select>
      </div>

      {/* Asset Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar Activos <span className="text-red-500">*</span>
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddAsset(e.target.value, 1);
              e.target.value = '';
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
        >
          <option value="">Agregar activo...</option>
          {assets
            .filter(asset => !selectedAssets.find(a => a.codigo_activo === asset.codigo_activo))
            .map((asset) => (
              <option key={asset.codigo_activo} value={asset.codigo_activo}>
                #{asset.codigo_activo} - {asset.nombre} (Disponibles: {asset.cantidad})
              </option>
            ))}
        </select>
      </div>

      {/* Selected Assets List */}
      {selectedAssets.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Activos seleccionados ({selectedAssets.length}):
          </p>
          <div className="space-y-2">
            {selectedAssets.map((asset) => (
              <div key={asset.codigo_activo} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      #{asset.codigo_activo} - {asset.nombre}
                    </p>
                    {asset.ubicacion && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        Ubicación actual: {asset.ubicacion.nombre_ambiente}
                        {asset.ubicacion.bloque && ` - Bloque ${asset.ubicacion.bloque}`}
                      </p>
                    )}

                    {/* Quantity Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-700">
                        Cantidad a prestar:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={asset.cantidad}
                        value={asset.cantidadPrestada}
                        onChange={(e) => handleQuantityChange(asset.codigo_activo, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900"
                      />
                      <span className="text-xs text-gray-500">
                        de {asset.cantidad} disponibles
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset(asset.codigo_activo)}
                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Devolución Esperada (Opcional)
        </label>
        <input
          type="datetime-local"
          value={formData.fecha_devolucion_esperada}
          onChange={(e) => setFormData({ ...formData, fecha_devolucion_esperada: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">
          Si no se especifica, el préstamo no tendrá fecha límite
        </p>
      </div>

      {/* Temporary Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación Temporal (Opcional)
        </label>
        <select
          value={formData.ubicacion_temporal}
          onChange={(e) => setFormData({ ...formData, ubicacion_temporal: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all"
        >
          <option value="">Sin ubicación temporal</option>
          {ubicaciones.map((ub) => (
            <option key={ub.codigo_ubicacion} value={ub.codigo_ubicacion}>
              {ub.nombre_ambiente} {ub.bloque ? `- Bloque ${ub.bloque}` : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Donde estará el activo durante el préstamo
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Se creará un préstamo individual para cada activo seleccionado.
          La cantidad disponible del activo se reducirá automáticamente.
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={createLoan.isPending}>
          Registrar Préstamo{selectedAssets.length > 1 ? 's' : ''}
        </Button>
      </div>
    </form>
  );
}
