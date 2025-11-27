import { supabase } from '../../lib/supabase';

export const assetService = {
  async getAll() {
    const { data, error } = await supabase
      .from('activo')
      .select(`
        *,
        ubicacion:ubicacion_actual (nombre_ambiente, bloque)
      `)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('activo')
      .select('*')
      .eq('codigo_activo', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(asset) {
    const { data, error } = await supabase
      .from('activo')
      .insert([asset])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('activo')
      .update(updates)
      .eq('codigo_activo', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
