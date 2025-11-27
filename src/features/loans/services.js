import { supabase } from '../../lib/supabase';

export const loanService = {
  async getActive() {
    const { data, error } = await supabase
      .from('prestamo')
      .select(`
        *,
        activo:codigo_activo (nombre, codigo_activo, categoria),
        persona:carnet_persona (nombre, carnet)
      `)
      .eq('estado_prestamo', 'pendiente')
      .order('fecha_prestamo', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('prestamo')
      .select(`
        *,
        activo:codigo_activo (nombre, codigo_activo, categoria),
        persona:carnet_persona (nombre, carnet, tipo_persona)
      `)
      .order('fecha_prestamo', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(loan) {
    const { data, error } = await supabase
      .from('prestamo')
      .insert([{
        ...loan,
        fecha_prestamo: new Date().toISOString(),
        estado_prestamo: 'pendiente'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async returnLoan(codigo_prestamo) {
    const { data, error } = await supabase
      .from('prestamo')
      .update({
        fecha_devolucion: new Date().toISOString(),
        estado_prestamo: 'devuelto'
      })
      .eq('codigo_prestamo', codigo_prestamo)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Verificar si un activo está disponible para préstamo
  async isAssetAvailable(codigo_activo) {
    const { data, error } = await supabase
      .from('prestamo')
      .select('codigo_prestamo')
      .eq('codigo_activo', codigo_activo)
      .eq('estado_prestamo', 'pendiente')
      .maybeSingle();

    if (error) throw error;
    return !data; // true si no hay préstamo activo
  }
};
