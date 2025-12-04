import React, { useState } from 'react';
import { Plus, Filter, Eye } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { AssetTable } from '../features/assets/components/AssetTable';
import { AssetForm } from '../features/assets/components/AssetForm';
import { useAssets, useDeleteAsset } from '../features/assets/hooks';
import { useAuth } from '../contexts/AuthContext';
import { permissionUtils } from '../lib/permissionUtils';

export function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const { user } = useAuth();

  const canModify = permissionUtils.canEdit(user);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  const handleEdit = (asset) => {
    if (!canModify) {
      alert('⚠️ No tienes permisos para editar activos');
      return;
    }
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (codigo_activo) => {
    if (!canModify) {
      alert('⚠️ No tienes permisos para eliminar activos');
      return;
    }
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
          <p className="text-sm text-gray-500 mt-1">
            {canModify ? 'Gestiona todos los bienes de la institución' : 'Vista de solo lectura del inventario'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
          {canModify && (
            <Button onClick={handleOpenModal}>
              <Plus size={16} className="mr-2" />
              Nuevo Activo
            </Button>
          )}
          {!canModify && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Eye size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Solo Lectura</span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <AssetTable
          assets={assets}
          isLoading={isLoading}
          onEdit={canModify ? handleEdit : null}
          onDelete={canModify ? handleDelete : null}
        />
      </Card>

      {canModify && (
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
      )}
    </div>
  );
}
