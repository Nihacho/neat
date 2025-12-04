import React from 'react';
import { CheckCircle2, Clock, AlertCircle, MapPin } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { format } from 'date-fns';

const statusMap = {
  pendiente: { variant: 'warning', icon: Clock, label: 'Pendiente' },
  devuelto: { variant: 'success', icon: CheckCircle2, label: 'Devuelto' },
  retraso: { variant: 'danger', icon: AlertCircle, label: 'Con Retraso' },
};

export function LoanTable({ loans, isLoading, onReturn }) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando préstamos...</div>;
  }

  if (!loans?.length) {
    return <div className="p-8 text-center text-gray-500">No hay préstamos registrados.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activo</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Persona</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Préstamo</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Esperada</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loans.map((loan) => {
            const status = statusMap[loan.estado_prestamo];
            const StatusIcon = status.icon;
            const isOverdue = loan.fecha_devolucion_esperada &&
              new Date(loan.fecha_devolucion_esperada) < new Date() &&
              loan.estado_prestamo === 'pendiente';

            return (
              <tr key={loan.codigo_prestamo} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{loan.codigo_prestamo}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {loan.activo?.nombre || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Código: {loan.activo?.codigo_activo}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {loan.persona?.nombre || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {loan.persona?.carnet}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(loan.fecha_prestamo), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {loan.fecha_devolucion_esperada ? (
                    <div>
                      <div>{format(new Date(loan.fecha_devolucion_esperada), 'dd/MM/yyyy HH:mm')}</div>
                      {isOverdue && (
                        <div className="text-xs text-red-600 font-medium mt-1">¡Atrasado!</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin fecha límite</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={status.variant} className="inline-flex items-center gap-1">
                    <StatusIcon size={12} />
                    {status.label}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  {(loan.estado_prestamo === 'pendiente' || loan.estado_prestamo === 'retraso') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReturn(loan.codigo_prestamo)}
                    >
                      Devolver
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
