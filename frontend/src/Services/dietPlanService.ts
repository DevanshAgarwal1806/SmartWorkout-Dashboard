import { supabase } from '../supabaseClient';

export interface DietPlanEntry {
  id: string;
  user_id: string;
  name: string;
  plan: string;
  created_at: string;
}

export async function saveDietPlan(name: string, plan: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('diet_plans')
    .insert([{ user_id: user.id, name, plan }])
    .select()
    .single();
  if (error) throw error;
  return data as DietPlanEntry;
}

export async function fetchDietPlans(): Promise<DietPlanEntry[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as DietPlanEntry[];
}

export async function deleteDietPlan(id: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('diet_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
}
