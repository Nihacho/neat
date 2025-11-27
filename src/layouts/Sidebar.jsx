import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Users, ClipboardList, MapPin, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Box, label: 'Activos', to: '/activos' },
  { icon: Users, label: 'Personas', to: '/personas' },
  { icon: ClipboardList, label: 'Préstamos', to: '/prestamos' },
  { icon: MapPin, label: 'Ubicaciones', to: '/ubicaciones' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-primary">Neat<span className="text-secondary">Admin</span></h1>
        <p className="text-xs text-gray-500 mt-1">Control de Activos</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
