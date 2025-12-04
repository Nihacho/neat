import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { supabase } from '../lib/supabase';

export function UbicacionesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch ubicaciones
  const { data: ubicaciones = [], isLoading } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ubicacion')
        .select('*')
        .order('nombre_ambiente', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (ubicacion) => {
      if (ubicacion.codigo_ubicacion) {
        // Update
        const { data, error } = await supabase
          .from('ubicacion')
          .update({
            nombre_ambiente: ubicacion.nombre_ambiente,
            piso: ubicacion.piso,
            bloque: ubicacion.bloque,
          })
          .eq('codigo_ubicacion', ubicacion.codigo_ubicacion)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from('ubicacion')
          .insert({
            nombre_ambiente: ubicacion.nombre_ambiente,
            piso: ubicacion.piso,
            bloque: ubicacion.bloque,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ubicaciones']);
      setIsModalOpen(false);
      setEditingUbicacion(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (codigo) => {
      const { error } = await supabase
        .from('ubicacion')
        .delete()
        .eq('codigo_ubicacion', codigo);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ubicaciones']);
    },
  });

  const handleEdit = (ubicacion) => {
    setEditingUbicacion(ubicacion);
    setIsModalOpen(true);
  };

  const handleDelete = (codigo) => {
    if (window.confirm('¿Está seguro de eliminar esta ubicación?')) {
      deleteMutation.mutate(codigo);
    }
  };

  const handleOpenModal = () => {
    setEditingUbicacion(null);
    setIsModalOpen(true);
  };

  const filteredUbicaciones = ubicaciones.filter((ub) =>
    ub.nombre_ambiente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ub.bloque && ub.bloque.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (ub.piso && ub.piso.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Ubicaciones</h2>
          <p className="text-sm text-gray-500 mt-1">Administra ambientes, bloques y pisos de la universidad</p>
        </div>
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus size={18} />
          Nueva Ubicación
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, bloque o piso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ubicaciones Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            Cargando ubicaciones...
          </CardContent>
        </Card>
      ) : filteredUbicaciones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            {searchTerm ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUbicaciones.map((ubicacion) => (
            <Card key={ubicacion.codigo_ubicacion} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-900 to-red-800 rounded-lg">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{ubicacion.nombre_ambiente}</h3>
                      <p className="text-xs text-gray-500">Código: {ubicacion.codigo_ubicacion}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {ubicacion.bloque && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 size={16} className="text-red-900" />
                      <span>Bloque: <span className="font-medium">{ubicacion.bloque}</span></span>
                    </div>
                  )}
                  {ubicacion.piso && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-red-800" />
                      <span>Piso: <span className="font-medium">{ubicacion.piso}</span></span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(ubicacion)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(ubicacion.codigo_ubicacion)}
                    className="flex items-center justify-center gap-2"
                    isLoading={deleteMutation.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <UbicacionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUbicacion(null);
        }}
        ubicacion={editingUbicacion}
        onSave={saveMutation.mutate}
        isLoading={saveMutation.isPending}
      />
    </div>
  );
}

function UbicacionModal({ isOpen, onClose, ubicacion, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    nombre_ambiente: '',
    piso: '',
    bloque: '',
  });

  React.useEffect(() => {
    if (ubicacion) {
      setFormData({
        nombre_ambiente: ubicacion.nombre_ambiente || '',
        piso: ubicacion.piso || '',
        bloque: ubicacion.bloque || '',
      });
    } else {
      setFormData({
        nombre_ambiente: '',
        piso: '',
        bloque: '',
      });
    }
  }, [ubicacion, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      ...(ubicacion && { codigo_ubicacion: ubicacion.codigo_ubicacion }),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ubicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Ambiente *
          </label>
          <input
            type="text"
            required
            value={formData.nombre_ambiente}
            onChange={(e) => setFormData({ ...formData, nombre_ambiente: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ej: Laboratorio de Computación 1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Piso
            </label>
            <input
              type="text"
              value={formData.piso}
              onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: 2do"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bloque
            </label>
            <input
              type="text"
              value={formData.bloque}
              onChange={(e) => setFormData({ ...formData, bloque: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: A"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {ubicacion ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
