'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, CreditCard } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

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
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-12">
          {/* Hero Image */}
          <div className="w-full md:w-1/2">
            <img 
              src="/hero-image.png" 
              alt="Dedicate Place Hero"
              className="rounded-lg shadow-xl h-[300px] md:h-[400px] object-cover mx-auto mt-4"
              suppressHydrationWarning
            />
          </div>

          {/* Hero Text */}
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Widme, was dir wichtig ist.
            </h1>
            <p className="text-xl text-muted-foreground">
             Mit deinepatenschaft.de verwalten Städte, Parks, Stiftungen und Zoos ganz einfach Patenschaften für Bänke, Bäume, Beete, Tiere und andere Objekte – digital, effizient, DSGVO-konform und kinderleicht in der Anwendung.
            </p>
            {/* <div className="flex gap-4">
              <Button size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div> */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObjects?.map((object) => (
            <Card key={object.id}>
              <CardHeader>
                <CardTitle>
                  <a
                    href={`/home/${object.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600"
                  >
                    {object.title_de}
                  </a>
                </CardTitle>
                {object.image_urls && object.image_urls.length > 0 ? (
                  <div className="relative w-full h-48 mt-2">
                    <Image
                      src={object.image_urls[0]}
                      alt={object.title_de || 'Object image'}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-md mt-2 flex items-center justify-center text-gray-400">
                    No image
                  </div>
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
  );
} 