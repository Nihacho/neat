import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Users,
  AlertCircle,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Clock,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Badge } from '../components/Badge';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

function StatCard({ title, value, icon: Icon, gradient, trend, isLoading }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {isLoading ? '...' : value}
            </h3>
            {trend && (
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <TrendingUp size={12} className="text-green-500" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ icon: Icon, title, description, time, color }) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <div className="text-xs text-gray-400 whitespace-nowrap">
        {time}
      </div>
    </div>
  );
}

export function DashboardPage() {
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total activos
      const { count: totalActivos } = await supabase
        .from('activo')
        .select('*', { count: 'exact', head: true });

      // Get active prestamos
      const { count: prestamosActivos } = await supabase
        .from('prestamo')
        .select('*', { count: 'exact', head: true })
        .eq('estado_prestamo', 'pendiente');

      // Get delayed prestamos (overdue)
      const { data: allPrestamos } = await supabase
        .from('prestamo')
        .select('fecha_devolucion_esperada, estado_prestamo')
        .eq('estado_prestamo', 'pendiente');

      const now = new Date();
      const prestamosRetraso = allPrestamos?.filter(p =>
        p.fecha_devolucion_esperada && new Date(p.fecha_devolucion_esperada) < now
      ).length || 0;

      // Get available activos (not in active loans)
      const { data: activosEnPrestamo } = await supabase
        .from('prestamo')
        .select('codigo_activo')
        .eq('estado_prestamo', 'pendiente');

      const activosDisponibles = totalActivos - (activosEnPrestamo?.length || 0);

      // Get total personas
      const { count: totalPersonas } = await supabase
        .from('persona')
        .select('*', { count: 'exact', head: true });

      // Get total ubicaciones
      const { count: totalUbicaciones } = await supabase
        .from('ubicacion')
        .select('*', { count: 'exact', head: true });

      return {
        totalActivos: totalActivos || 0,
        prestamosActivos: prestamosActivos || 0,
        prestamosRetraso: prestamosRetraso || 0,
        activosDisponibles: activosDisponibles || 0,
        totalPersonas: totalPersonas || 0,
        totalUbicaciones: totalUbicaciones || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent prestamos
  const { data: recentPrestamos = [], isLoading: prestamosLoading } = useQuery({
    queryKey: ['recent-prestamos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prestamo')
        .select(`
          *,
          activo:codigo_activo(nombre),
          persona:carnet_persona(nombre, tipo_persona)
        `)
        .order('fecha_prestamo', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch activos by category
  const { data: activosByCategoria = [], isLoading: categoriaLoading } = useQuery({
    queryKey: ['activos-by-categoria'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activo')
        .select('categoria');

      if (error) throw error;

      // Count by category
      const counts = {};
      data.forEach(activo => {
        counts[activo.categoria] = (counts[activo.categoria] || 0) + 1;
      });

      return Object.entries(counts).map(([categoria, count]) => ({
        categoria,
        count,
      }));
    },
  });

  // Fetch activos by estado
  const { data: activosByEstado = [], isLoading: estadoLoading } = useQuery({
    queryKey: ['activos-by-estado'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activo')
        .select('estado');

      if (error) throw error;

      const counts = {};
      data.forEach(activo => {
        counts[activo.estado] = (counts[activo.estado] || 0) + 1;
      });

      return Object.entries(counts).map(([estado, count]) => ({
        estado,
        count,
      }));
    },
  });

  const estadoColors = {
    nuevo: 'bg-green-100 text-green-700',
    usado: 'bg-blue-100 text-blue-700',
    dañado: 'bg-red-100 text-red-700',
    en_reparacion: 'bg-yellow-100 text-yellow-700',
  };

  const estadoLabels = {
    nuevo: 'Nuevo',
    usado: 'Usado',
    dañado: 'Dañado',
    en_reparacion: 'En Reparación',
  };

  const categoriaLabels = {
    mueble: 'Muebles',
    audio: 'Audio',
    computacion: 'Computación',
    herramienta: 'Herramientas',
    otro: 'Otros',
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">
          Panel de Control
        </h2>
        <p className="text-sm text-gray-500 mt-1">Resumen general del sistema de activos</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Activos"
          value={stats?.totalActivos || 0}
          icon={Box}
          gradient="from-blue-500 to-blue-600"
          isLoading={statsLoading}
        />
        <StatCard
          title="Préstamos Activos"
          value={stats?.prestamosActivos || 0}
          icon={Users}
          gradient="from-purple-500 to-purple-600"
          isLoading={statsLoading}
        />
        <StatCard
          title="Con Retraso"
          value={stats?.prestamosRetraso || 0}
          icon={AlertCircle}
          gradient="from-red-500 to-red-600"
          trend={stats?.prestamosRetraso > 0 ? 'Requiere atención' : 'Todo al día'}
          isLoading={statsLoading}
        />
        <StatCard
          title="Disponibles"
          value={stats?.activosDisponibles || 0}
          icon={CheckCircle2}
          gradient="from-green-500 to-green-600"
          isLoading={statsLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Personas</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {statsLoading ? '...' : stats?.totalPersonas || 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Ubicaciones</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {statsLoading ? '...' : stats?.totalUbicaciones || 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <MapPin size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {prestamosLoading ? (
              <div className="p-12 text-center text-gray-400">
                Cargando actividad...
              </div>
            ) : recentPrestamos.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No hay actividad reciente
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPrestamos.map((prestamo) => (
                  <ActivityItem
                    key={prestamo.codigo_prestamo}
                    icon={prestamo.estado_prestamo === 'pendiente' ? Clock : CheckCircle2}
                    title={`Préstamo de ${prestamo.activo?.nombre || 'Activo'}`}
                    description={`Por ${prestamo.persona?.nombre || 'Usuario'} - ${prestamo.persona?.tipo_persona || ''}`}
                    time={prestamo.fecha_prestamo ? format(new Date(prestamo.fecha_prestamo), 'dd/MM/yyyy') : '-'}
                    color={
                      prestamo.estado_prestamo === 'pendiente'
                        ? 'bg-blue-500'
                        : prestamo.estado_prestamo === 'retraso'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution by Category */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Package size={20} className="text-purple-600" />
              Distribución por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {categoriaLoading ? (
              <div className="text-center text-gray-400 py-8">
                Cargando datos...
              </div>
            ) : activosByCategoria.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No hay datos disponibles
              </div>
            ) : (
              <div className="space-y-4">
                {activosByCategoria.map(({ categoria, count }) => {
                  const total = activosByCategoria.reduce((sum, item) => sum + item.count, 0);
                  const percentage = ((count / total) * 100).toFixed(1);

                  return (
                    <div key={categoria}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {categoriaLabels[categoria] || categoria}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-red-900 to-red-800 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estado Distribution */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={20} className="text-green-600" />
            Estado de los Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {estadoLoading ? (
            <div className="text-center text-gray-400 py-8">
              Cargando datos...
            </div>
          ) : activosByEstado.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No hay datos disponibles
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activosByEstado.map(({ estado, count }) => (
                <div key={estado} className="text-center">
                  <div className="mb-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${estadoColors[estado]}`}>
                      {count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {estadoLabels[estado] || estado}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
