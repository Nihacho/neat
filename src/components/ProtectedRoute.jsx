import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * Componente para proteger rutas que requieren autenticación y permisos específicos
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene acceso
 * @param {number} props.requiredLevel - Nivel de permiso requerido (1 = admin, 2 = lectura)
 */
export function ProtectedRoute({ children, requiredLevel = 2 }) {
    const { isAuthenticated, user, isLoading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Redirigir a login si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar nivel de permiso
    // nivel_permiso: 1 = admin (acceso completo), 2 = solo lectura
    // Si requiredLevel es 1, solo usuarios con nivel 1 pueden acceder
    // Si requiredLevel es 2, usuarios con nivel 1 o 2 pueden acceder
    const hasAccess = user.nivel_permiso <= requiredLevel;

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <ShieldAlert className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                    <p className="text-gray-600 mb-6">
                        No tienes los permisos necesarios para acceder a esta sección.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Tu nivel de acceso:</span>{' '}
                            {user.nivel_permiso === 1 ? 'Administrador' : 'Solo Lectura'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            <span className="font-semibold">Nivel requerido:</span>{' '}
                            {requiredLevel === 1 ? 'Administrador' : 'Solo Lectura'}
                        </p>
                    </div>
                    <a
                        href="/"
                        className="inline-block px-6 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors"
                    >
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

    return children;
}
