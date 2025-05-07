import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Roles } from '@/constants/data';
import UserListPage from '@/features/users/components/user-listing';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Users'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/auth/sign-in');
  }

  if (user.user_metadata.first_name === undefined) {
    const { data: profile } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();

    if (profile) {
      user.user_metadata['first_name'] = profile.first_name;
      user.user_metadata['last_name'] = profile.last_name;
      user.user_metadata['role'] = profile.role;
    }
  }

  if (user.user_metadata.role !== Roles.admin) {
    return redirect('/dashboard/project');
  }

  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const key = serialize({ ...searchParams });

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Users' description='Manage users' />
        </div>
        <Separator />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <UserListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
