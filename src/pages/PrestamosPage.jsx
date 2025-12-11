import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LoanTable } from '../features/loans/components/LoanTable';
import { LoanForm } from '../features/loans/components/LoanForm';
import { useLoans, useReturnLoan } from '../features/loans/hooks';

export function PrestamosPage() {
  const { data: loans, isLoading } = useLoans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const returnLoan = useReturnLoan();

  const handleReturn = async (codigo_prestamo) => {
    if (window.confirm('¿Confirmar devolución del activo?')) {
      try {
        await returnLoan.mutateAsync(codigo_prestamo);
        alert('✅ Devolución registrada exitosamente');
      } catch (error) {
        alert('Error al registrar devolución: ' + error.message);
      }
    }
  };

  const handleSuccess = () => {
    alert('✅ Préstamo registrado exitosamente');
  };

  // Filtrar préstamos por estado
  const filteredLoans = filterStatus
    ? loans?.filter(loan => loan.estado_prestamo === filterStatus)
    : loans;

  return (
    <div className="space-y-6 slide-up">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">Gestión de Préstamos</h2>
          <p className="text-sm text-gray-500 mt-1">Control de préstamos y devoluciones</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} className="mr-2" />
              Filtros
              {filterStatus && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">1</span>}
            </Button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900">
                      Filtrar por Estado
                    </label>
                    {filterStatus && (
                      <button
                        onClick={() => {
                          setFilterStatus('');
                          setIsFilterOpen(false);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setFilterStatus('');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === ''
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Todos los estados
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('pendiente');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === 'pendiente'
                        ? 'bg-yellow-50 text-yellow-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('devuelto');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === 'devuelto'
                        ? 'bg-green-50 text-green-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Devuelto
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('retraso');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === 'retraso'
                        ? 'bg-red-50 text-red-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Retraso
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo Préstamo
          </Button>
        </div>
      </div>

      <Card>
        <LoanTable
          loans={filteredLoans}
          isLoading={isLoading}
          onReturn={handleReturn}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Préstamo"
        size="md"
      >
        <LoanForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      </Modal>
    </div>
  );
}
