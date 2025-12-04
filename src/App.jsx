import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsPage } from './pages/AssetsPage';
import { PersonasPage } from './pages/PersonasPage';
import { PrestamosPage } from './pages/PrestamosPage';
import { UbicacionesPage } from './pages/UbicacionesPage';
import { ReportesPage } from './pages/ReportesPage';
import { UsuariosPage } from './pages/UsuariosPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute requiredLevel={2}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="activos" element={<AssetsPage />} />
              <Route path="personas" element={<ProtectedRoute requiredLevel={1}><PersonasPage /></ProtectedRoute>} />
              <Route path="prestamos" element={<ProtectedRoute requiredLevel={1}><PrestamosPage /></ProtectedRoute>} />
              <Route path="ubicaciones" element={<ProtectedRoute requiredLevel={1}><UbicacionesPage /></ProtectedRoute>} />
              <Route path="reportes" element={<ProtectedRoute requiredLevel={1}><ReportesPage /></ProtectedRoute>} />
              <Route path="usuarios" element={<ProtectedRoute requiredLevel={1}><UsuariosPage /></ProtectedRoute>} />
            </Route>

            {/* Redirect unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
