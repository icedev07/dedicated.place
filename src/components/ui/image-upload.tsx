'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from './button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  folder: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const files = e.target.files;
      if (!files?.length) return;

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('dedicated.place.storage')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('dedicated.place.storage')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      onChange([...value, ...urls]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="ml-2">Uploading...</span>
        </div>
      )}
      <div className="mb-4 flex items-center gap-4">
        <Button
          type="button"
          disabled={loading}
          variant="secondary"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onUpload}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {value.map((url) => (
          <div key={url} className="relative group">
            <div className="aspect-square relative">
              <Image
                fill
                className="object-cover rounded-md"
                alt="Image"
                src={url}
              />
            </div>
            <Button
              type="button"
              onClick={() => onRemove(url)}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 