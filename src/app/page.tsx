import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  redirect('/home');
  // if (!user) {
  //   return redirect('/auth/sign-in');
  // } else {
  //   redirect('/dashboard/project');
  // }
}
