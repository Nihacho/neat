import React, { useState } from 'react';
import { FileText, User, Package, Download, Calendar, Users } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AssetTable } from '../features/assets/components/AssetTable';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export function ReportesPage() {
  const [reportType, setReportType] = useState('persona'); // 'persona' | 'activo' | 'todas_personas' | 'todos_activos'
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
      // Si es "todas_personas", obtener lista de personas
      if (reportType === 'todas_personas') {
        const { data: personasData, error: personasError } = await supabase
          .from('persona')
          .select('*')
          .order('nombre', { ascending: true });

        if (personasError) throw personasError;

        // Obtener conteo de préstamos por persona
        const { data: prestamosData, error: prestamosError } = await supabase
          .from('prestamo')
          .select('carnet_persona, estado_prestamo');

        if (prestamosError) throw prestamosError;

        // Calcular estadísticas por persona
        const prestamosStats = {};
        prestamosData?.forEach(p => {
          if (!prestamosStats[p.carnet_persona]) {
            prestamosStats[p.carnet_persona] = { total: 0, pendientes: 0, devueltos: 0 };
          }
          prestamosStats[p.carnet_persona].total++;
          if (p.estado_prestamo === 'pendiente' || p.estado_prestamo === 'retraso') {
            prestamosStats[p.carnet_persona].pendientes++;
          } else if (p.estado_prestamo === 'devuelto') {
            prestamosStats[p.carnet_persona].devueltos++;
          }
        });

        // Combinar datos
        return personasData?.map(persona => ({
          ...persona,
          total_prestamos: prestamosStats[persona.carnet]?.total || 0,
          prestamos_pendientes: prestamosStats[persona.carnet]?.pendientes || 0,
          prestamos_devueltos: prestamosStats[persona.carnet]?.devueltos || 0
        }));
      }

      // Si es "todos_activos", obtener inventario de activos
      if (reportType === 'todos_activos') {
        const { data: activosData, error: activosError } = await supabase
          .from('activo')
          .select(`
            *,
            ubicacion:codigo_ubicacion (nombre)
          `)
          .order('nombre', { ascending: true });

        if (activosError) throw activosError;

        // Obtener conteo de préstamos pendientes por activo
        const { data: prestamosData, error: prestamosError } = await supabase
          .from('prestamo')
          .select('codigo_activo, estado_prestamo')
          .in('estado_prestamo', ['pendiente', 'retraso']);

        if (prestamosError) throw prestamosError;

        // Calcular disponibilidad
        const prestamosCount = {};
        prestamosData?.forEach(p => {
          prestamosCount[p.codigo_activo] = (prestamosCount[p.codigo_activo] || 0) + 1;
        });

        // Combinar datos
        return activosData?.map(activo => ({
          ...activo,
          total_prestados: prestamosCount[activo.codigo_activo] || 0,
          disponible: activo.cantidad - (prestamosCount[activo.codigo_activo] || 0)
        }));
      }

      // Para otros tipos de reporte (persona o activo individual), obtener préstamos
      // Si no hay selectedId para estos tipos, retornar null
      if ((reportType === 'persona' || reportType === 'activo') && !selectedId) {
        return null;
      }

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
      } else if (reportType === 'activo') {
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
    enabled: true, // Siempre habilitado
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const handleExport = () => {
    if (!reportData || reportData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    let headers, rows;

    // Si es lista de personas
    if (reportType === 'todas_personas') {
      headers = ['Carnet', 'Nombre', 'Tipo', 'Teléfono', 'Email', 'Total Préstamos', 'Pendientes', 'Devueltos'];
      rows = reportData.map(persona => [
        persona.carnet,
        persona.nombre,
        persona.tipo_persona,
        persona.telefono || 'N/A',
        persona.email || 'N/A',
        persona.total_prestamos,
        persona.prestamos_pendientes,
        persona.prestamos_devueltos
      ]);
    } else if (reportType === 'todos_activos') {
      // Si es inventario de activos
      headers = ['Código', 'Nombre', 'Categoría', 'Estado', 'Ubicación', 'Cantidad Total', 'Prestados', 'Disponibles'];
      rows = reportData.map(activo => [
        activo.codigo_activo,
        activo.nombre,
        activo.categoria,
        activo.estado,
        activo.ubicacion?.nombre || 'Sin ubicación',
        activo.cantidad,
        activo.total_prestados,
        activo.disponible
      ]);
    } else {
      // Para reportes de préstamos
      headers = (reportType === 'persona')
        ? ['Código Préstamo', 'Activo', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']
        : ['Código Préstamo', 'Persona', 'Fecha Préstamo', 'Fecha Devolución', 'Estado'];

      rows = reportData.map(loan => {
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
    }

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

  const stats = reportData ? (
    reportType === 'todas_personas' ? {
      total: reportData.length,
      con_prestamos: reportData.filter(p => p.total_prestamos > 0).length,
      pendientes: reportData.filter(p => p.prestamos_pendientes > 0).length,
      sin_prestamos: reportData.filter(p => p.total_prestamos === 0).length,
    } : reportType === 'todos_activos' ? {
      total: reportData.length,
      disponibles: reportData.filter(a => a.disponible > 0).length,
      prestados: reportData.filter(a => a.total_prestados > 0).length,
      agotados: reportData.filter(a => a.disponible === 0).length,
    } : {
      total: reportData.length,
      pendientes: reportData.filter(l => l.estado_prestamo === 'pendiente').length,
      devueltos: reportData.filter(l => l.estado_prestamo === 'devuelto').length,
      retraso: reportData.filter(l => l.estado_prestamo === 'retraso').length,
    }
  ) : null;

  return (
    <div className="space-y-6 slide-up">
      <Breadcrumbs />
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

          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => {
                setReportType('persona');
                setSelectedId('');
              }}
              className={`p-3 rounded-lg border-2 transition-all ${reportType === 'persona'
                ? 'border-purple-900 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <User className={`w-6 h-6 mx-auto mb-2 ${reportType === 'persona' ? 'text-purple-900' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${reportType === 'persona' ? 'text-purple-900' : 'text-gray-600'}`}>
                Por Persona
              </p>
            </button>

            <button
              onClick={() => {
                setReportType('activo');
                setSelectedId('');
              }}
              className={`p-3 rounded-lg border-2 transition-all ${reportType === 'activo'
                ? 'border-purple-900 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <Package className={`w-6 h-6 mx-auto mb-2 ${reportType === 'activo' ? 'text-purple-900' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${reportType === 'activo' ? 'text-purple-900' : 'text-gray-600'}`}>
                Por Activo
              </p>
            </button>

            <button
              onClick={() => {
                setReportType('todas_personas');
                setSelectedId('');
              }}
              className={`p-3 rounded-lg border-2 transition-all ${reportType === 'todas_personas'
                ? 'border-purple-900 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <Users className={`w-6 h-6 mx-auto mb-2 ${reportType === 'todas_personas' ? 'text-purple-900' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${reportType === 'todas_personas' ? 'text-purple-900' : 'text-gray-600'}`}>
                Todas las Personas
              </p>
            </button>

            <button
              onClick={() => {
                setReportType('todos_activos');
                setSelectedId('');
              }}
              className={`p-3 rounded-lg border-2 transition-all ${reportType === 'todos_activos'
                ? 'border-purple-900 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
                }`}
            >
              <Package className={`w-6 h-6 mx-auto mb-2 ${reportType === 'todos_activos' ? 'text-purple-900' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${reportType === 'todos_activos' ? 'text-purple-900' : 'text-gray-600'}`}>
                Todos los Activos
              </p>
            </button>
          </div>

          {/* Selection - Solo mostrar si es reporte individual */}
          {(reportType === 'persona' || reportType === 'activo') && (
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
          )}

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
      {(selectedId || reportType === 'todas_personas' || reportType === 'todos_activos') && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    {reportType === 'todas_personas' ? 'Total Personas' : reportType === 'todos_activos' ? 'Total Activos' : 'Total Préstamos'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    {reportType === 'todas_personas' ? 'Con Préstamos' : reportType === 'todos_activos' ? 'Disponibles' : 'Pendientes'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reportType === 'todas_personas' ? stats.con_prestamos : reportType === 'todos_activos' ? stats.disponibles : stats.pendientes}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    {reportType === 'todas_personas' ? 'Con Pendientes' : reportType === 'todos_activos' ? 'Con Préstamos' : 'Devueltos'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {reportType === 'todas_personas' ? stats.pendientes : reportType === 'todos_activos' ? stats.prestados : stats.devueltos}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    {reportType === 'todas_personas' ? 'Sin Préstamos' : reportType === 'todos_activos' ? 'Agotados' : 'Con Retraso'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {reportType === 'todas_personas' ? stats.sin_prestamos : reportType === 'todos_activos' ? stats.agotados : stats.retraso}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Table */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reportType === 'todas_personas' ? 'Lista de Personas' : reportType === 'todos_activos' ? 'Inventario de Activos' : 'Historial de Préstamos'}
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
              ) : reportType === 'todas_personas' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Carnet</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Préstamos</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pendientes</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Devueltos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reportData.map(persona => (
                        <tr key={persona.carnet} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {persona.carnet}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {persona.nombre}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${persona.tipo_persona === 'estudiante'
                              ? 'bg-blue-100 text-blue-800'
                              : persona.tipo_persona === 'docente'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {persona.tipo_persona}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {persona.telefono || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {persona.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {persona.total_prestamos}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-orange-600">
                            {persona.prestamos_pendientes}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            {persona.prestamos_devueltos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : reportType === 'todos_activos' ? (
                <AssetTable
                  assets={reportData}
                  onEdit={() => { }}
                  onDelete={() => { }}
                  canModify={false}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Código</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          {reportType === 'persona' || reportType === 'todas_personas' ? 'Activo' : 'Persona'}
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
                            {(reportType === 'persona' || reportType === 'todas_personas')
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
