'use client';
import { notFound } from 'next/navigation';
import ProjectForm from './project-form';
import { useProject } from '@/hooks/use-project';

type TProjectViewPageProps = {
  projectId: string;
};

export default function ProjectViewPage({ projectId }: TProjectViewPageProps) {
  const { selectedProject } = useProject();
  let pageTitle = 'Create New Projects';

  if (projectId !== 'new') {
    if (!selectedProject) {
      notFound();
    }
    pageTitle = `Edit Project`;
  }

  return <ProjectForm initialData={selectedProject} pageTitle={pageTitle} />;
}
