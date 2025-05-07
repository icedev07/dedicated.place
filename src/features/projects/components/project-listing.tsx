'use client';
import { useProject } from '@/hooks/use-project';
import { ProjectTable } from './project-tables';
import { columns } from './project-tables/columns';

type ProjectListingPage = {};

export default function ProjectListingPage({ }: ProjectListingPage) {
  const { projects } = useProject();
  return (
    <ProjectTable
      data={projects}
      totalItems={projects.length}
      columns={columns}
    />
  );
}
