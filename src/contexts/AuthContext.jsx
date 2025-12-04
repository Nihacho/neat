import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../features/auth/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar usuario al montar el componente
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (correo, password) => {
        const { user: loggedUser, error } = await authService.login(correo, password);

        if (error) {
            return { success: false, error };
        }

        setUser(loggedUser);
        return { success: true, user: loggedUser };
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const hasPermission = (requiredLevel) => {
        if (!user) return false;
        // Nivel 1 = admin (acceso completo)
        // Nivel 2 = solo lectura
        return user.nivel_permiso <= requiredLevel;
    };

    const isAuthenticated = !!user;

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        hasPermission,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
