'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PublicObject } from '@/types/public-object';

export default function ObjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [object, setObject] = useState<PublicObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchObject = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from('objects').select('*').eq('id', id).single();
      setObject(data);
      setLoading(false);
    };
    fetchObject();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-500" />
    </div>
  );
  if (!object) return <div>Not found</div>;

  return (
    <div className="container mx-auto py-16 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Object</h1>
      {success && (
        <Alert className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Object updated successfully.</AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={async e => {
          e.preventDefault();
          setSaving(true);
          const supabase = createClient();
          await supabase.from('objects').update({
            title_de: object.title_de,
            description_de: object.description_de,
          }).eq('id', id);
          setSaving(false);
          setSuccess(true);
        }}
        className="space-y-4"
      >
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={object.title_de}
          onChange={e => setObject({ ...object, title_de: e.target.value })}
          required
        />
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={object.description_de}
          onChange={e => setObject({ ...object, description_de: e.target.value })}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : null}
            Update
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/providers')} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}