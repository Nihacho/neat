import React from 'react';
import { Box, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/Card';

function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className={`p-4 rounded-full ${color} bg-opacity-10 mr-4`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel General</h2>
        <p className="text-sm text-gray-500">Resumen del estado de los activos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Activos"
          value="1,245"
          icon={Box}
          color="bg-blue-500"
          trend="+12 nuevos esta semana"
        />
        <StatCard
          title="Préstamos Activos"
          value="45"
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Con Retraso"
          value="3"
          icon={AlertCircle}
          color="bg-red-500"
          trend="Requiere atención"
        />
        <StatCard
          title="Disponibles"
          value="1,197"
          icon={CheckCircle2}
          color="bg-green-500"
        />
      </div>

      {/* Placeholder for Recent Activity or Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="p-6 text-center text-gray-400 flex items-center justify-center h-full">
            Gráfico de Préstamos (Próximamente)
          </div>
        </Card>
        <Card className="h-96">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Distribución por Categoría</h3>
          </div>
          <div className="p-6 text-center text-gray-400 flex items-center justify-center h-full">
            Gráfico Circular (Próximamente)
          </div>
        </Card>
      </div>
    </div>
  );
}
