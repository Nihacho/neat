import React from 'react';
import { Card, CardContent } from '../components/Card';

export function UbicacionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Ubicaciones</h2>
        <p className="text-sm text-gray-500">Ambientes, bloques y pisos</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center text-gray-400">
          Módulo en desarrollo
        </CardContent>
      </Card>
    </div>
  );
}
