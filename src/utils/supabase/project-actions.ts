'use server';
import { Project } from '@/constants/data';
import { createClient } from '@/utils/supabase/server';

export const deleteProjectAction = async (id: string): Promise<boolean> => {
  const supabase = await createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error
  return true

};

export const addProjectAction = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select();

  if (error) throw error;

  return data[0]
}


export const updateProjectAction = async (id: string, project: Partial<Project>): Promise<Project> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select();

  if (error) throw error;

  return data[0]
}