import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import ProjectViewPage from '@/features/projects/components/project-view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Project View'
};

type PageProps = { params: Promise<{ projectId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <ProjectViewPage projectId={params.projectId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
