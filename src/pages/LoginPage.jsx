import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, AlertCircle, Eye, EyeOff, Clock } from 'lucide-react';
import { Button } from '../components/Button';

export function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { login } = useAuth();
    const navigate = useNavigate();

    // Actualizar reloj cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(correo, password);

        if (result.success) {
            // Redirigir según nivel de permiso
            if (result.user.nivel_permiso === 1) {
                navigate('/'); // Admin va al dashboard completo
            } else {
                navigate('/activos'); // Solo lectura va directo a activos
            }
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: 'url(/FondoLogin.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Overlay para oscurecer el fondo */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            {/* Reloj discreto en esquina inferior izquierda */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-lg shadow-lg px-4 py-2 z-10">
                <div className="flex items-center gap-2">
                    <Clock className="text-red-900" size={16} />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{formatTime(currentTime)}</p>
                        <p className="text-xs text-gray-600 capitalize">{formatDate(currentTime)}</p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Univalle */}
                <div className="text-center mb-6">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-4">
                        <div className="flex items-center justify-center mb-4">
                            <img
                                src="/LogoUnivalle.png"
                                alt="Univalle Logo"
                                className="h-24 w-24 object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-red-900 mb-2">Univalle</h1>
                        <div className="h-1 w-20 bg-gradient-to-r from-red-900 to-red-700 mx-auto rounded-full mb-3"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Sistema de Inventario</h2>
                        <p className="text-sm text-gray-600 mt-2">Ingrese sus credenciales para continuar</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Error de autenticación</p>
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="correo"
                                    type="email"
                                    required
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-colors"
                                    placeholder="correo@ejemplo.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={20} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-colors"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full py-3 text-base font-semibold"
                            isLoading={isLoading}
                        >
                            <LogIn size={20} className="mr-2" />
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Footer Info */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-500">
                            Solo funcionarios autorizados pueden acceder al sistema
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-gray-700 font-medium">
                        ¿Problemas para acceder? Contacte al administrador del sistema
                    </p>
                </div>
            </div>
        </div>
    );
}
