import { supabase } from '../../lib/supabase';

export const loanService = {
  async getActive() {
    const { data, error } = await supabase
      .from('prestamo')
      .select(`
        *,
        activo:codigo_activo (nombre, codigo_activo, categoria, ubicacion_actual, cantidad),
        persona:carnet_persona (nombre, carnet)
      `)
      .in('estado_prestamo', ['pendiente', 'retraso'])
      .order('fecha_prestamo', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('prestamo')
      .select(`
        *,
        activo:codigo_activo (nombre, codigo_activo, categoria, ubicacion_actual, cantidad),
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
    // First, get the loan details to increment asset quantity
    const { data: loan, error: fetchError } = await supabase
      .from('prestamo')
      .select('codigo_activo, activo:codigo_activo(cantidad)')
      .eq('codigo_prestamo', codigo_prestamo)
      .single();

    if (fetchError) throw fetchError;

    // Update loan status
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

    // Increment asset quantity (return the borrowed unit)
    if (loan.activo) {
      await supabase
        .from('activo')
        .update({ cantidad: loan.activo.cantidad + 1 })
        .eq('codigo_activo', loan.codigo_activo);
    }

    return data;
  },

  // Check and update overdue loans (only if fecha_devolucion_esperada column exists)
  async updateOverdueLoans() {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('prestamo')
        .update({ estado_prestamo: 'retraso' })
        .eq('estado_prestamo', 'pendiente')
        .lt('fecha_devolucion_esperada', now)
        .not('fecha_devolucion_esperada', 'is', null);

      if (error) {
        // Column might not exist yet, ignore error
        console.warn('Could not update overdue loans:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Error updating overdue loans:', err);
      return null;
    }
  },

  // Verificar si un activo está disponible para préstamo
  async isAssetAvailable(codigo_activo) {
    const { data, error } = await supabase
      .from('prestamo')
      .select('codigo_prestamo')
      .eq('codigo_activo', codigo_activo)
      .in('estado_prestamo', ['pendiente', 'retraso'])
      .maybeSingle();

    if (error) throw error;
    return !data; // true si no hay préstamo activo
  }
};
