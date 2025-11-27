import React from 'react';
import { Card, CardContent } from '../components/Card';

export function PersonasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Personas</h2>
        <p className="text-sm text-gray-500">Docentes, Funcionarios y Estudiantes</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center text-gray-400">
          Módulo en desarrollo
        </CardContent>
      </Card>
    </div>
  );
}
