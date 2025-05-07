// src/app/providers/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProvidersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/sign-in');
  }

  // Optionally, check for provider role here if you want role-based access
  // if (user.role !== 'provider') return redirect('/unauthorized');

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-4 text-primary">Providers</h1>
      <p className="text-lg text-muted-foreground">
        This is the Providers page. Here, organizations like cities, parks, and foundations can manage their public objects and billing profiles.
      </p>
    </div>
  );
}