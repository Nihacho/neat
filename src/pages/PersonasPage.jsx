import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, User, GraduationCap, Briefcase, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { supabase } from '../lib/supabase';

const TIPO_PERSONA_CONFIG = {
  docente: {
    label: 'Docente',
    icon: GraduationCap,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  funcionario: {
    label: 'Funcionario',
    icon: Briefcase,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    badgeColor: 'bg-green-100 text-green-700',
  },
  estudiante: {
    label: 'Estudiante',
    icon: User,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
};

export function PersonasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const queryClient = useQueryClient();

  // Fetch personas
  const { data: personas = [], isLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persona')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch specific persona details
  const fetchPersonaDetails = async (carnet, tipo) => {
    let table = '';
    if (tipo === 'docente') table = 'docente';
    else if (tipo === 'funcionario') table = 'funcionario';
    else if (tipo === 'estudiante') table = 'estudiante';

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('carnet', carnet)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (personaData) => {
      const { carnet, nombre, telefono, correo, tipo_persona, ...extraData } = personaData;
      const isUpdate = editingPersona !== null;

      // Save to persona table
      if (isUpdate) {
        const { error: personaError } = await supabase
          .from('persona')
          .update({ nombre, telefono, correo, tipo_persona })
          .eq('carnet', carnet);

        if (personaError) throw personaError;
      } else {
        const { error: personaError } = await supabase
          .from('persona')
          .insert({ carnet, nombre, telefono, correo, tipo_persona });

        if (personaError) throw personaError;
      }

      // Save to specific table
      let specificTable = '';
      if (tipo_persona === 'docente') specificTable = 'docente';
      else if (tipo_persona === 'funcionario') specificTable = 'funcionario';
      else if (tipo_persona === 'estudiante') specificTable = 'estudiante';

      if (specificTable) {
        if (isUpdate) {
          // Delete old record and insert new one (in case tipo changed)
          await supabase.from('docente').delete().eq('carnet', carnet);
          await supabase.from('funcionario').delete().eq('carnet', carnet);
          await supabase.from('estudiante').delete().eq('carnet', carnet);
        }

        const { error: specificError } = await supabase
          .from(specificTable)
          .insert({ carnet, ...extraData });

        if (specificError) throw specificError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personas']);
      setIsModalOpen(false);
      setEditingPersona(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (carnet) => {
      const { error } = await supabase
        .from('persona')
        .delete()
        .eq('carnet', carnet);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personas']);
    },
  });

  const handleEdit = async (persona) => {
    const details = await fetchPersonaDetails(persona.carnet, persona.tipo_persona);
    setEditingPersona({ ...persona, ...details });
    setIsModalOpen(true);
  };

  const handleDelete = (carnet) => {
    if (window.confirm('¿Está seguro de eliminar esta persona?')) {
      deleteMutation.mutate(carnet);
    }
  };

  const handleOpenModal = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const filteredPersonas = personas.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.carnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.correo && p.correo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTipo = filterTipo === 'all' || p.tipo_persona === filterTipo;

    return matchesSearch && matchesTipo;
  });

  // Count by type
  const counts = {
    all: personas.length,
    docente: personas.filter(p => p.tipo_persona === 'docente').length,
    funcionario: personas.filter(p => p.tipo_persona === 'funcionario').length,
    estudiante: personas.filter(p => p.tipo_persona === 'estudiante').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Personas</h2>
          <p className="text-sm text-gray-500 mt-1">Administra docentes, funcionarios y estudiantes</p>
        </div>
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus size={18} />
          Nueva Persona
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all ${filterTipo === 'all' ? 'ring-2 ring-red-900' : 'hover:shadow-md'}`}
          onClick={() => setFilterTipo('all')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
            </div>
          </CardContent>
        </Card>

        {Object.entries(TIPO_PERSONA_CONFIG).map(([tipo, config]) => (
          <Card
            key={tipo}
            className={`cursor-pointer transition-all ${filterTipo === tipo ? 'ring-2 ring-red-900' : 'hover:shadow-md'}`}
            onClick={() => setFilterTipo(tipo)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-3 ${config.color} rounded-lg`}>
                <config.icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{config.label}s</p>
                <p className="text-2xl font-bold text-gray-900">{counts[tipo]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, carnet o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personas List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            Cargando personas...
          </CardContent>
        </Card>
      ) : filteredPersonas.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            {searchTerm || filterTipo !== 'all' ? 'No se encontraron personas' : 'No hay personas registradas'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persona
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carnet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPersonas.map((persona) => {
                    const config = TIPO_PERSONA_CONFIG[persona.tipo_persona];
                    const Icon = config.icon;

                    return (
                      <tr key={persona.carnet} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${config.color} rounded-lg`}>
                              <Icon className="text-white" size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{persona.nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{persona.carnet}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.badgeColor}`}>
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{persona.correo || '-'}</div>
                          <div className="text-sm text-gray-500">{persona.telefono || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(persona)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(persona.carnet)}
                              isLoading={deleteMutation.isPending}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPersona(null);
        }}
        persona={editingPersona}
        onSave={saveMutation.mutate}
        isLoading={saveMutation.isPending}
      />
    </div>
  );
}

function PersonaModal({ isOpen, onClose, persona, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    carnet: '',
    nombre: '',
    telefono: '',
    correo: '',
    tipo_persona: 'estudiante',
    // Docente
    especialidad: '',
    departamento: '',
    grado_academico: '',
    // Funcionario
    cargo: '',
    area_trabajo: '',
    nivel_permiso: 1,
    // Estudiante
    carrera: '',
    semestre: '',
    ru: '',
  });

  React.useEffect(() => {
    if (persona) {
      setFormData({
        carnet: persona.carnet || '',
        nombre: persona.nombre || '',
        telefono: persona.telefono || '',
        correo: persona.correo || '',
        tipo_persona: persona.tipo_persona || 'estudiante',
        especialidad: persona.especialidad || '',
        departamento: persona.departamento || '',
        grado_academico: persona.grado_academico || '',
        cargo: persona.cargo || '',
        area_trabajo: persona.area_trabajo || '',
        nivel_permiso: persona.nivel_permiso || 1,
        carrera: persona.carrera || '',
        semestre: persona.semestre || '',
        ru: persona.ru || '',
      });
    } else {
      setFormData({
        carnet: '',
        nombre: '',
        telefono: '',
        correo: '',
        tipo_persona: 'estudiante',
        especialidad: '',
        departamento: '',
        grado_academico: '',
        cargo: '',
        area_trabajo: '',
        nivel_permiso: 1,
        carrera: '',
        semestre: '',
        ru: '',
      });
    }
  }, [persona, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const baseData = {
      carnet: formData.carnet,
      nombre: formData.nombre,
      telefono: formData.telefono,
      correo: formData.correo,
      tipo_persona: formData.tipo_persona,
    };

    let extraData = {};
    if (formData.tipo_persona === 'docente') {
      extraData = {
        especialidad: formData.especialidad,
        departamento: formData.departamento,
        grado_academico: formData.grado_academico,
      };
    } else if (formData.tipo_persona === 'funcionario') {
      extraData = {
        cargo: formData.cargo,
        area_trabajo: formData.area_trabajo,
        nivel_permiso: parseInt(formData.nivel_permiso),
      };
    } else if (formData.tipo_persona === 'estudiante') {
      extraData = {
        carrera: formData.carrera,
        semestre: formData.semestre ? parseInt(formData.semestre) : null,
        ru: formData.ru,
      };
    }

    onSave({ ...baseData, ...extraData });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={persona ? 'Editar Persona' : 'Nueva Persona'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Base Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carnet *
            </label>
            <input
              type="text"
              required
              disabled={!!persona}
              value={formData.carnet}
              onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Persona *
            </label>
            <select
              required
              value={formData.tipo_persona}
              onChange={(e) => setFormData({ ...formData, tipo_persona: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="funcionario">Funcionario</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conditional Fields */}
        {formData.tipo_persona === 'docente' && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Información de Docente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grado Académico
              </label>
              <input
                type="text"
                value={formData.grado_academico}
                onChange={(e) => setFormData({ ...formData, grado_academico: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {formData.tipo_persona === 'funcionario' && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Información de Funcionario</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área de Trabajo
                </label>
                <input
                  type="text"
                  value={formData.area_trabajo}
                  onChange={(e) => setFormData({ ...formData, area_trabajo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Permiso (1-2)
              </label>
              <input
                type="number"
                min="1"
                max="2"
                value={formData.nivel_permiso}
                onChange={(e) => setFormData({ ...formData, nivel_permiso: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {formData.tipo_persona === 'estudiante' && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Información de Estudiante</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrera
                </label>
                <input
                  type="text"
                  value={formData.carrera}
                  onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semestre
                </label>
                <input
                  type="number"
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RU (Registro Universitario)
              </label>
              <input
                type="text"
                value={formData.ru}
                onChange={(e) => setFormData({ ...formData, ru: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {persona ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
