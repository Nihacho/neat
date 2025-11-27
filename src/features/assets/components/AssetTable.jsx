import React from 'react';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { format } from 'date-fns';

const statusMap = {
  nuevo: 'success',
  usado: 'info',
  dañado: 'danger',
  en_reparacion: 'warning',
};

export function AssetTable({ assets, isLoading }) {
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
          <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-4">Código</th>
            <th className="px-6 py-4">Nombre / Descripción</th>
            <th className="px-6 py-4">Categoría</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Ubicación</th>
            <th className="px-6 py-4 text-right">Acciones</th>
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
                    <span className="text-xs text-gray-400">({asset.ubicacion.bloque})</span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Sin ubicación</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1 text-gray-400 hover:text-primary transition-colors">
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
