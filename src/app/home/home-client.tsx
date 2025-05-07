'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, CreditCard } from 'lucide-react';
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
    <div>
      <div className="relative bg-background border-b border-border">
        <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
          {/* Hero Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="/hero-image.png" 
              alt="Dedicate Place Hero"
              className="rounded-lg shadow-xl h-full h-auto object-cover mx-auto"
            />
          </div>

          {/* Hero Text */}
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Create Lasting Memories
            </h1>
            <p className="text-xl text-muted-foreground">
              Dedicate a special place to honor your loved ones or commemorate important moments. Our platform helps you create meaningful connections between memories and locations.
            </p>
            <div className="flex gap-4">
              <Button size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
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

        <div className="h-[calc(100vh-12rem)] overflow-y-auto">
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
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 