'use client';

import { Button } from '@/components/ui/button';
import { MapPin, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function ObjectDetailClient({ object }: { object: any }) {
  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">{object.title_de}</h1>
      {object.image_urls && object.image_urls.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {object.image_urls.map((url: string, idx: number) => (
            <div key={idx} className="relative w-full h-64">
              <Image
                src={url}
                alt={object.title_de || 'Object image'}
                fill
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
          No image
        </div>
      )}
      <p className="mb-4 text-lg">{object.description_de}</p>
      <div className="flex gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => window.open(`https://www.google.com/maps?q=${object.latitude},${object.longitude}`, '_blank')}
          className="flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          View on Map
        </Button>
        <Button
          variant="default"
          onClick={() => window.open(`/payment/${object.id}`, '_blank')}
          className="flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Make Payment
        </Button>
      </div>
    </div>
  );
} 