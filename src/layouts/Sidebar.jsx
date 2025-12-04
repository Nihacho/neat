import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, Users, ClipboardList, MapPin, FileText, Shield, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSION_LEVELS } from '../lib/permissionUtils';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel de Control', to: '/', requiredLevel: 2 },
  { icon: Box, label: 'Activos', to: '/activos', requiredLevel: 2 },
  { icon: Users, label: 'Personas', to: '/personas', requiredLevel: 1 },
  { icon: ClipboardList, label: 'Préstamos', to: '/prestamos', requiredLevel: 1 },
  { icon: MapPin, label: 'Ubicaciones', to: '/ubicaciones', requiredLevel: 1 },
  { icon: FileText, label: 'Reportes', to: '/reportes', requiredLevel: 1 },
  { icon: Shield, label: 'Usuarios', to: '/usuarios', requiredLevel: 1 },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filtrar items del menú según nivel de permiso del usuario
  const visibleNavItems = navItems.filter(item => {
    if (!user) return false;
    return user.nivel_permiso <= item.requiredLevel;
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10 shadow-sm">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-red-900 to-red-800">
        <div className="flex items-center gap-3">
          <img
            src="/univalle-logo.png"
            alt="Univalle Logo"
            className="w-12 h-12 rounded-full bg-white p-1 shadow-md"
          />
          <div>
            <h1 className="text-lg font-bold text-white">Univalle</h1>
            <p className="text-xs text-red-100">Control de Activos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-red-900 to-red-800 text-white shadow-md'
                  : 'text-gray-600 hover:bg-red-50 hover:text-red-900'
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
