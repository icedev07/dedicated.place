import { createClient } from './client';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'dedicated.place.storage';
const FOLDER = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_FOLDER || '';

export async function uploadObjectImage(file: File, objectId?: string): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${objectId || Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = FOLDER ? `${FOLDER}/${fileName}` : fileName;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) return null;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || null;
} 