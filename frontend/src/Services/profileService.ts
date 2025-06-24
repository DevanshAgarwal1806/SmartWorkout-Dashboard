import { supabase } from '../supabaseClient';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: string;
  created_at: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) return null;
  return data as UserProfile;
}

export async function upsertUserProfile(profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at'>) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('user_profiles')
    .upsert([{ ...profile, user_id: user.id }], { onConflict: 'user_id' });
  if (error) throw error;
}
