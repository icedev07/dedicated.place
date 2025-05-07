'use server';
import { Profile } from '@/constants/data';
import { createClient } from '@/utils/supabase/server';

export const updateProfileAction = async (
  id: string,
  updatedProfile: Omit<Profile, 'id'>
): Promise<Profile> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', id)
      .select();
    if (error) throw error;

    return data[0] as Profile;
  } catch (error) {
    throw error;
  }
};

export const deleteProfileAction = async (id: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    throw error;
  }
};
