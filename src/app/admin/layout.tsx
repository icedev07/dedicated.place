import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Sidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect('/auth/sign-in');
  // }

  // Check if user is admin
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single();

  // if (!profile || profile.role !== 'admin') {
  //   redirect('/home');
  // }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
} 