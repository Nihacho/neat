import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { permissionUtils } from '../lib/permissionUtils';

export function Header() {
  const { user } = useAuth();

  const getInitials = (nombre) => {
    if (!nombre) return 'U';
    const parts = nombre.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">{user.cargo || 'Funcionario'}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.nivel_permiso === 1
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  {permissionUtils.getPermissionLevelName(user.nivel_permiso)}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-900 to-red-800 text-white flex items-center justify-center font-bold shadow-md">
              {getInitials(user.nombre)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
