import React, { useState } from 'react';
import { Shield, UserPlus, Edit2, Trash2, Search } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre_completo: '',
    rol: 'usuario',
    activo: true,
  });

  const queryClient = useQueryClient();

  // Fetch usuarios
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create usuario
  const createMutation = useMutation({
    mutationFn: async (userData) => {
      const { data, error } = await supabase
        .from('usuario')
        .insert([userData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsModalOpen(false);
      resetForm();
      alert('✅ Usuario creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear usuario: ' + error.message);
    },
  });

  // Update usuario
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...userData }) => {
      const { data, error } = await supabase
        .from('usuario')
        .update(userData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
      alert('✅ Usuario actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar usuario: ' + error.message);
    },
  });

  // Delete usuario
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('usuario')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      alert('✅ Usuario eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar usuario: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nombre_completo: '',
      rol: 'usuario',
      activo: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
      const updateData = { ...formData };
      // No enviar password si está vacío (no se quiere cambiar)
      if (!updateData.password) {
        delete updateData.password;
      }
      updateMutation.mutate({ id: editingUser.id, ...updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      username: usuario.username,
      password: '', // No mostrar password
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
    resetForm();
    setIsModalOpen(true);
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-indigo-700 bg-clip-text text-transparent">
            Control de Usuarios
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gestión de usuarios del sistema</p>
        </div>
        <Button onClick={handleNewUser}>
          <UserPlus size={16} className="mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay usuarios registrados</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nombre Completo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">{usuario.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {usuario.nombre_completo}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={usuario.rol === 'admin' ? 'danger' : 'info'}>
                        {usuario.rol}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={usuario.activo ? 'success' : 'secondary'}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          resetForm();
        }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900"
              placeholder="nombre.usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {editingUser && <span className="text-xs text-gray-500">(dejar vacío para no cambiar)</span>}
              {!editingUser && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900"
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-indigo-900 border-gray-300 rounded focus:ring-indigo-900"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Usuario activo
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
