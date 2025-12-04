import React, { useState } from 'react';
import { FileText, User, Package, Download, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export function ReportesPage() {
  const [reportType, setReportType] = useState('persona'); // 'persona' | 'activo'
  const [selectedId, setSelectedId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  // Fetch activos
  const { data: activos = [] } = useQuery({
    queryKey: ['activos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activo')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch report data
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report', reportType, selectedId, dateFrom, dateTo],
    queryFn: async () => {
      if (!selectedId) return null;

      let query = supabase
        .from('prestamo')
        .select(`
          *,
          activo:codigo_activo (nombre, codigo_activo, categoria),
          persona:carnet_persona (nombre, carnet, tipo_persona)
        `)
        .order('fecha_prestamo', { ascending: false });

      if (reportType === 'persona') {
        query = query.eq('carnet_persona', selectedId);
      } else {
        query = query.eq('codigo_activo', parseInt(selectedId));
      }

      if (dateFrom) {
        query = query.gte('fecha_prestamo', new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        query = query.lte('fecha_prestamo', new Date(dateTo).toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedId,
  });

  const handleExport = () => {
    if (!reportData || reportData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = reportType === 'persona'
      ? ['Código Préstamo', 'Activo', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']
      : ['Código Préstamo', 'Persona', 'Fecha Préstamo', 'Fecha Devolución', 'Estado'];

    const rows = reportData.map(loan => {
      if (reportType === 'persona') {
        return [
          loan.codigo_prestamo,
          loan.activo?.nombre || 'N/A',
          format(new Date(loan.fecha_prestamo), 'dd/MM/yyyy HH:mm'),
          loan.fecha_devolucion ? format(new Date(loan.fecha_devolucion), 'dd/MM/yyyy HH:mm') : 'Pendiente',
          loan.estado_prestamo
        ];
      } else {
        return [
          loan.codigo_prestamo,
          loan.persona?.nombre || 'N/A',
          format(new Date(loan.fecha_prestamo), 'dd/MM/yyyy HH:mm'),
          loan.fecha_devolucion ? format(new Date(loan.fecha_devolucion), 'dd/MM/yyyy HH:mm') : 'Pendiente',
          loan.estado_prestamo
        ];
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${reportType}_${selectedId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = reportData ? {
    total: reportData.length,
    pendientes: reportData.filter(l => l.estado_prestamo === 'pendiente').length,
    devueltos: reportData.filter(l => l.estado_prestamo === 'devuelto').length,
    retraso: reportData.filter(l => l.estado_prestamo === 'retraso').length,
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent">
            Reportes
          </h2>
          <p className="text-sm text-gray-500 mt-1">Genera reportes detallados de préstamos</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Reporte</h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setReportType('persona');
                setSelectedId('');
              }}
              className={`p-4 rounded-lg border-2 transition-all ${reportType === 'persona'
                  ? 'border-purple-900 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <User className={`w-8 h-8 mx-auto mb-2 ${reportType === 'persona' ? 'text-purple-900' : 'text-gray-400'}`} />
              <p className={`font-medium ${reportType === 'persona' ? 'text-purple-900' : 'text-gray-600'}`}>
                Por Persona
              </p>
            </button>

            <button
              onClick={() => {
                setReportType('activo');
                setSelectedId('');
              }}
              className={`p-4 rounded-lg border-2 transition-all ${reportType === 'activo'
                  ? 'border-purple-900 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <Package className={`w-8 h-8 mx-auto mb-2 ${reportType === 'activo' ? 'text-purple-900' : 'text-gray-400'}`} />
              <p className={`font-medium ${reportType === 'activo' ? 'text-purple-900' : 'text-gray-600'}`}>
                Por Activo
              </p>
            </button>
          </div>

          {/* Selection */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {reportType === 'persona' ? 'Seleccionar Persona' : 'Seleccionar Activo'}
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900"
            >
              <option value="">Seleccionar...</option>
              {reportType === 'persona'
                ? personas.map(p => (
                  <option key={p.carnet} value={p.carnet}>
                    {p.nombre} - {p.carnet} ({p.tipo_persona})
                  </option>
                ))
                : activos.map(a => (
                  <option key={a.codigo_activo} value={a.codigo_activo}>
                    #{a.codigo_activo} - {a.nombre}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {selectedId && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">Total Préstamos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">Devueltos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.devueltos}</p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">Con Retraso</p>
                  <p className="text-2xl font-bold text-red-600">{stats.retraso}</p>
                </div>
              </Card>
            </div>
          )}

          {/* Table */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Historial de Préstamos
                </h3>
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Exportar CSV
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Cargando...</div>
              ) : !reportData || reportData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay datos para mostrar</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          {reportType === 'persona' ? 'Activo' : 'Persona'}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Préstamo</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Devolución</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reportData.map(loan => (
                        <tr key={loan.codigo_prestamo} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            #{loan.codigo_prestamo}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {reportType === 'persona'
                              ? loan.activo?.nombre || 'N/A'
                              : loan.persona?.nombre || 'N/A'
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {format(new Date(loan.fecha_prestamo), 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {loan.fecha_devolucion
                              ? format(new Date(loan.fecha_devolucion), 'dd/MM/yyyy HH:mm')
                              : <span className="text-gray-400">Pendiente</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${loan.estado_prestamo === 'devuelto'
                                ? 'bg-green-100 text-green-800'
                                : loan.estado_prestamo === 'retraso'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {loan.estado_prestamo}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
