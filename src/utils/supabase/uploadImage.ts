import { createClient } from './client';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'dedicated.place.storage';
const FOLDER = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_FOLDER || 'test';

export async function uploadObjectImage(file: File, objectId?: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${objectId || Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${FOLDER}/${fileName}`;

    // Upload file with authenticated user
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}