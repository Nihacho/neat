import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Box,
  Users,
  ClipboardList,
  TrendingUp,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch quick stats for footer
  const { data: stats } = useQuery({
    queryKey: ['footer-stats'],
    queryFn: async () => {
      const [activos, personas, prestamos] = await Promise.all([
        supabase.from('activo').select('codigo_activo', { count: 'exact', head: true }),
        supabase.from('persona').select('carnet', { count: 'exact', head: true }),
        supabase.from('prestamo').select('codigo_prestamo', { count: 'exact', head: true }),
      ]);

      return {
        totalActivos: activos.count || 0,
        totalPersonas: personas.count || 0,
        totalPrestamos: prestamos.count || 0,
      };
    },
    refetchInterval: 60000, // Actualizar cada minuto
  });

  const quickLinks = [
    { name: 'Panel de Control', to: '/' },
    { name: 'Activos', to: '/activos' },
    { name: 'Personas', to: '/personas' },
    { name: 'Préstamos', to: '/prestamos' },
  ];

  const resources = [
    { name: 'Ubicaciones', to: '/ubicaciones' },
    { name: 'Reportes', to: '/reportes' },
    { name: 'Usuarios', to: '/usuarios' },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border-b border-red-700/30">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3 group hover:scale-105 transition-transform">
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                <Box className="text-red-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.totalActivos || 0}</p>
                <p className="text-xs text-gray-400">Activos Registrados</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group hover:scale-105 transition-transform">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Users className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.totalPersonas || 0}</p>
                <p className="text-xs text-gray-400">Personas Registradas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 group hover:scale-105 transition-transform">
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <ClipboardList className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.totalPrestamos || 0}</p>
                <p className="text-xs text-gray-400">Préstamos Totales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Univalle</h3>
                <p className="text-xs text-gray-400">Control de Activos</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Sistema integral de gestión de activos institucionales para la Universidad del Valle.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Recursos
            </h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <span>Universidad del Valle<br />Cochabamba, Bolivia</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone size={16} className="text-red-400 flex-shrink-0" />
                <a href="tel:+59144444444" className="hover:text-red-400 transition-colors">
                  +591 4 444 4444
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={16} className="text-red-400 flex-shrink-0" />
                <a href="mailto:activos@univalle.edu" className="hover:text-red-400 transition-colors">
                  activos@univalle.edu
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© {currentYear} Universidad del Valle.</span>
              <span className="hidden md:inline">Todos los derechos reservados.</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Hecho con</span>
              <Heart size={14} className="text-red-500 animate-pulse" />
              <span>por el equipo de desarrollo</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>Última actualización: {new Date().toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
