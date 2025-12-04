import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Users, ClipboardList, MapPin, FileText, Shield, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Panel de Control', to: '/' },
  { icon: Box, label: 'Activos', to: '/activos' },
  { icon: Users, label: 'Personas', to: '/personas' },
  { icon: ClipboardList, label: 'Préstamos', to: '/prestamos' },
  { icon: MapPin, label: 'Ubicaciones', to: '/ubicaciones' },
  { icon: FileText, label: 'Reportes', to: '/reportes' },
  { icon: Shield, label: 'Usuarios', to: '/usuarios' },
];

export function Sidebar() {
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
        {navItems.map((item) => (
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
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
