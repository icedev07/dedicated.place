'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Object {
  id: string;
  title_de: string;
  description_de: string;
  latitude: number;
  longitude: number;
  image_urls?: string[];
}

export default function HomeClient({ objects }: { objects: Object[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredObjects = objects?.filter(object => {
    if (!searchQuery.trim()) return true;
    return (
      object.title_de?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object.description_de?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredObjects?.map((object) => (
          <Card key={object.id}>
            <CardHeader>
              <CardTitle>{object.title_de}</CardTitle>
              {object.image_urls && object.image_urls.length > 0 && (
                <img 
                  src={object.image_urls}
                  alt={object.title_de}
                  className="w-full h-48 object-cover rounded-md mt-2"
                />
              )}
              <CardDescription>{object.description_de}</CardDescription>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="default"
                  onClick={() => window.open(`https://www.google.com/maps?q=${object.latitude},${object.longitude}`, '_blank')}
                >
                  View on Map
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(`/payment/${object.id}`, '_blank')}
                >
                  Make Payment
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 