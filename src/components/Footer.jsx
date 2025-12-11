import React from 'react';
import { Heart, Github, Mail } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo y descripción */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/LogoUnivalle.png"
                            alt="Univalle Logo"
                            className="h-8 w-8 object-contain"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Univalle</p>
                            <p className="text-xs text-gray-500">Sistema de Inventario</p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            © {currentYear} Universidad del Valle. Todos los derechos reservados.
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                            Hecho con <Heart size={12} className="text-red-500 fill-current" /> por el equipo de desarrollo
                        </p>
                    </div>

                    {/* Versión */}
                    <div className="text-right">
                        <p className="text-xs font-medium text-gray-700">Versión 1.0.0</p>
                        <p className="text-xs text-gray-400">Build 2024.12</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
