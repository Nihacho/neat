import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeNames = {
    '/': 'Panel de Control',
    '/activos': 'Activos',
    '/personas': 'Personas',
    '/prestamos': 'Préstamos',
    '/ubicaciones': 'Ubicaciones',
    '/reportes': 'Reportes',
};

export function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link
                to="/"
                className="flex items-center hover:text-red-900 transition-colors"
            >
                <Home size={16} />
            </Link>

            {pathnames.length > 0 && (
                <>
                    <ChevronRight size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                        {routeNames[location.pathname] || 'Página'}
                    </span>
                </>
            )}
        </nav>
    );
}
