import { createClient } from '@/utils/supabase/server';
import ObjectDetailClient from './object-detail-client';

export default async function ObjectDetailPage({ params }: { params: { id: string } }) {
  // Ensure params.id is awaited if necessary (for edge runtime)
  const id = params.id;
  const supabase = await createClient();
  const { data: object, error } = await supabase
    .from('objects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !object) {
    return <div className="p-8">Object not found.</div>;
  }

  return <ObjectDetailClient object={object} />;
} 