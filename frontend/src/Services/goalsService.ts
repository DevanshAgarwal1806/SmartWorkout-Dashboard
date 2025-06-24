import { supabase } from '../supabaseClient';
import type { Goal } from '../types';

export async function getGoals(): Promise<Goal[]> {
  // Try to order by 'target_date', fallback to 'date' if error
  let { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .order('target_date', { ascending: true });
  if (error && error.message && error.message.includes('target_date')) {
    // Try fallback to 'date' column
    ({ data, error } = await supabase
      .from('user_goals')
      .select('*')
      .order('date', { ascending: true }));
  }
  if (error) throw error;
  return data as Goal[];
}

export async function addGoal(goal: { goal: string; target_date: string }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  // If your table uses 'date' instead of 'target_date', map it here
  const insertGoal: any = { ...goal, completed: false, user_id: user.id };
  if (!('target_date' in insertGoal) && 'date' in insertGoal) {
    insertGoal.date = goal.target_date;
    delete insertGoal.target_date;
  }
  const { error } = await supabase
    .from('user_goals')
    .insert([insertGoal]);
  if (error) throw error;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_goals')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function completeGoal(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_goals')
    .update({ completed })
    .eq('id', id);
  if (error) throw error;
}
