import { supabase } from '../supabaseClient';

export interface PersonalizedWorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  plan: string;
  created_at: string;
}

export async function savePersonalizedWorkout(name: string, plan: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('personalized_workouts')
    .insert([{ user_id: user.id, name, plan }])
    .select()
    .single();
  if (error) throw error;
  return data as PersonalizedWorkoutPlan;
}

export async function fetchPersonalizedWorkouts(): Promise<PersonalizedWorkoutPlan[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from('personalized_workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as PersonalizedWorkoutPlan[];
}

export async function deletePersonalizedWorkout(id: string) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('personalized_workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw error;
}
