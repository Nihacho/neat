import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AssetTable } from '../features/assets/components/AssetTable';
import { AssetForm } from '../features/assets/components/AssetForm';
import { useAssets, useDeleteAsset } from '../features/assets/hooks';

export function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (codigo_activo) => {
    if (window.confirm('¿Está seguro de eliminar este activo?')) {
      try {
        await deleteAsset.mutateAsync(codigo_activo);
        alert('✅ Activo eliminado exitosamente');
      } catch (error) {
        alert('❌ Error al eliminar: ' + error.message);
      }
    }
  };

  const handleOpenModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">Inventario de Activos</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona todos los bienes de la institución</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
          <Button onClick={handleOpenModal}>
            <Plus size={16} className="mr-2" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <Card>
        <AssetTable
          assets={assets}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
        }}
        title={editingAsset ? 'Editar Activo' : 'Registrar Nuevo Activo'}
        size="md"
      >
        <AssetForm
          asset={editingAsset}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAsset(null);
          }}
          onSuccess={handleSuccess}
        />
      </Modal>
    </div>
  );
}
