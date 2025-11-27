import { supabase } from '../../lib/supabase';

export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(persona) {
    const { data, error } = await supabase
      .from('persona')
      .insert([persona])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
