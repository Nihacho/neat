import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { LoanTable } from '../features/loans/components/LoanTable';
import { LoanForm } from '../features/loans/components/LoanForm';
import { useLoans, useReturnLoan } from '../features/loans/hooks';

export function PrestamosPage() {
  const { data: loans, isLoading } = useLoans();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Préstamos</h2>
          <p className="text-sm text-gray-500">Control de préstamos y devoluciones</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filtros
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo Préstamo
          </Button>
        </div>
      </div>

      <Card>
        <LoanTable
          loans={loans}
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
