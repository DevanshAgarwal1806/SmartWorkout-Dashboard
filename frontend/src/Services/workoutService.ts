import { supabase } from '../supabaseClient';
import type { WorkoutEntry } from '../types';

export async function logWorkout({ date, type, duration, calories, notes }: { date: string, type: string, duration?: number, calories?: number, notes?: string }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('workouts')
    .insert([{ user_id: user.id, date, type, duration, calories, notes }]);
  if (error) throw error;
}

export async function fetchWorkouts(limit = 100): Promise<WorkoutEntry[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as WorkoutEntry[];
}

export async function deleteWorkout(id: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  // Use .single() to ensure only one row is deleted and check for errors
  const { error, count } = await supabase
    .from('workouts')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
  if (count === 0) throw new Error('Workout not found or not authorized');
}
