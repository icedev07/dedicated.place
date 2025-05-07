import { createClient } from '@/utils/supabase/server';
import HomeClient from '@/app/home/home-client';

export default async function Page() {
  const supabase = await createClient();
  const { data: objects, error } = await supabase
    .from('objects')
    .select('*');

  if (error) {
    console.error('Error fetching objects:', error);
    return;
  }

  console.log("objects", objects);

  return <HomeClient objects={objects} />;
}
