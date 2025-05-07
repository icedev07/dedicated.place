// src/app/guardians/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function GuardiansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-4 text-primary">Guardians</h1>
      <p className="text-lg text-muted-foreground">
        This is the Guardians page. Park Guardians can submit reports, upload photos, and earn points for helping maintain public spaces.
      </p>
    </div>
  );
}