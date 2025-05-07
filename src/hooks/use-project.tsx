'use client';
import { ProjectContext, ProjectContextType } from '@/contexts/project-context';
import { useContext } from 'react';

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
