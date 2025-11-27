import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AssetTable } from '../features/assets/components/AssetTable';
import { AssetForm } from '../features/assets/components/AssetForm';
import { useAssets } from '../features/assets/hooks';

export function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    // Optionally show a success message
    alert('✅ Activo creado exitosamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario de Activos</h2>
          <p className="text-sm text-gray-500">Gestiona todos los bienes de la institución</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <Card>
        <AssetTable assets={assets} isLoading={isLoading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Activo"
        size="md"
      >
        <AssetForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      </Modal>
    </div>
  );
}
