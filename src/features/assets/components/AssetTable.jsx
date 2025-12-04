import React from 'react';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { format } from 'date-fns';

const statusMap = {
  nuevo: 'success',
  usado: 'info',
  dañado: 'danger',
  en_reparacion: 'warning',
};

export function AssetTable({ assets, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando activos...</div>;
  }

  if (!assets?.length) {
    return <div className="p-8 text-center text-gray-500">No hay activos registrados.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre / Descripción</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {assets.map((asset) => (
            <tr key={asset.codigo_activo} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                #{asset.codigo_activo}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{asset.nombre}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">{asset.descripcion}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                {asset.categoria}
              </td>
              <td className="px-6 py-4">
                <Badge variant={statusMap[asset.estado]}>
                  {asset.estado.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {asset.ubicacion ? (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {asset.ubicacion.nombre_ambiente}
                    {asset.ubicacion.bloque && (
                      <span className="text-xs text-gray-400">({asset.ubicacion.bloque})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Sin ubicación</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(asset)}
                    className="flex items-center gap-1"
                  >
                    <Edit size={14} />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(asset.codigo_activo)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
