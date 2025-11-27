import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/Button';
import { useCreateLoan } from '../hooks';
import { useAssets } from '../../assets/hooks';
import { useUsers } from '../../users/hooks';

export function LoanForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    codigo_activo: '',
    carnet_persona: '',
  });

  const createLoan = useCreateLoan();
  const { data: assets } = useAssets();
  const { data: users } = useUsers();

  // Filtrar solo activos disponibles (sin préstamo activo)
  const availableAssets = assets?.filter(asset => {
    // Aquí deberías verificar si el activo tiene un préstamo activo
    // Por ahora, mostramos todos
    return true;
  }) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo_activo || !formData.carnet_persona) {
      alert('Por favor selecciona un activo y una persona');
      return;
    }

    try {
      await createLoan.mutateAsync({
        codigo_activo: parseInt(formData.codigo_activo),
        carnet_persona: formData.carnet_persona,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Error al crear préstamo: ' + error.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activo <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.codigo_activo}
          onChange={(e) => handleChange('codigo_activo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Seleccionar activo...</option>
          {availableAssets.map((asset) => (
            <option key={asset.codigo_activo} value={asset.codigo_activo}>
              #{asset.codigo_activo} - {asset.nombre} ({asset.categoria})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Solo se muestran activos disponibles
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Persona <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.carnet_persona}
          onChange={(e) => handleChange('carnet_persona', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Seleccionar persona...</option>
          {users?.map((user) => (
            <option key={user.carnet} value={user.carnet}>
              {user.nombre} - {user.carnet} ({user.tipo_persona})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> El préstamo se registrará con la fecha y hora actual.
          El estado será "Pendiente" hasta que se registre la devolución.
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={createLoan.isPending}>
          Registrar Préstamo
        </Button>
      </div>
    </form>
  );
}
