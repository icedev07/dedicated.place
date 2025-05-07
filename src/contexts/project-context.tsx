'use client';
import { Project, Roles } from '@/constants/data';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/utils/supabase/client';
import {
  addProjectAction,
  deleteProjectAction,
  updateProjectAction
} from '@/utils/supabase/project-actions';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  updating: boolean;
  selectedProject: Project | null;
  fetchProjects: () => Promise<void>;
  addProject: (projectData: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [selectedProject, selectProject] = useState<Project | null>(null);

  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    try {
      setUpdating(true);
      const newProject = await addProjectAction(project);
      setProjects((oldValue) => {
        return [newProject, ...oldValue];
      });
    } catch (error) {
    } finally {
      setUpdating(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      if (user) {
        const supabase = await createClient();
        if (user.user_metadata.role === Roles.admin) {
          const { data, error } = await supabase
            .from('projects')
            .select()
            .order('created_at', { ascending: false });
          if (error) throw error;
          setProjects(data);
        } else if (user.user_metadata.role === Roles.client) {
          const { data, error } = await supabase
            .from('projects')
            .select()
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setProjects(data);
        } else if (user.user_metadata.role === Roles.designer) {
          const { data, error } = await supabase
            .from('projects')
            .select()
            .eq('assigned_designer', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setProjects(data);
        }
      }
    } catch (err: any) {
      toast.error('Failed to fetch projects list');
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProject = useCallback(
    async (id: string, projectData: Partial<Project>) => {
      try {
        setUpdating(true);
        const updatedProject = await updateProjectAction(id, projectData);
        if (updatedProject)
          setProjects((oldProjects) =>
            oldProjects.map((project) =>
              project.id === id ? updatedProject : project
            )
          );
      } catch (err: any) {
        toast.error('Failed to update project');
        console.error('Update project error:', err);
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  const deleteProject = useCallback(async (id: string) => {
    try {
      setUpdating(true);
      const result = await deleteProjectAction(id);
      if (result)
        setProjects((oldProjects) =>
          oldProjects.filter((item) => item.id !== id)
        );
    } catch (err: any) {
      toast.error('Failed to delete project');
      console.error('Delete project error:', err);
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        selectedProject,
        updating,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        selectProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
