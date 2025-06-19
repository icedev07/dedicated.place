'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, CreditCard, Globe, Tag, Info, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

function formatSimpleValue(field: any) {
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return String(field.value).charAt(0).toUpperCase() + String(field.value).slice(1);
  }
  if (typeof field === 'string') {
    return field.charAt(0).toUpperCase() + field.slice(1);
  }
  return '';
}

export default function ObjectDetailClient({ object }: { object: any }) {
  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary mb-2">{object.title_de || object.title_en}</CardTitle>
          <CardDescription className="text-lg">
            {object.description_de && <span>{object.description_de}</span>}
            {object.description_en && <span className="block text-muted-foreground">{object.description_en}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {object.image_urls && object.image_urls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {object.image_urls.map((url: string, idx: number) => (
                <div key={idx} className="relative w-full h-56 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={url}
                    alt={object.title_de || 'Object image'}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-56 bg-gray-100 rounded-lg mb-6 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="space-y-3">
            {object.type && (
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Type:</span>
                <Badge variant="outline">{formatSimpleValue(object.type)}</Badge>
              </div>
            )}
            {object.custom_type_name && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Custom Type:</span>
                <Badge>{object.custom_type_name}</Badge>
              </div>
            )}
            {object.special_tag && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Special Tag:</span>
                <Badge variant="secondary">{object.special_tag}</Badge>
              </div>
            )}
            {object.location_text && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{object.location_text}</span>
              </div>
            )}
            {(object.latitude || object.longitude) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Coordinates:</span>
                <span>{object.latitude}, {object.longitude}</span>
              </div>
            )}
            {object.price && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Price:</span>
                <Badge variant="outline">{object.price} €</Badge>
              </div>
            )}
            {object.plaque_allowed !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Plaque Allowed:</span>
                <Badge variant={object.plaque_allowed ? 'default' : 'secondary'}>{object.plaque_allowed ? 'Yes' : 'No'}</Badge>
              </div>
            )}
            {object.plaque_max_chars && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Plaque Max Chars:</span>
                <span>{object.plaque_max_chars}</span>
              </div>
            )}
            {object.status && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant="outline">{formatSimpleValue(object.status)}</Badge>
              </div>
            )}
            {object.booking_url && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Booking URL:</span>
                <a href={object.booking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{object.booking_url}</a>
              </div>
            )}
            {object.share_url && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Share URL:</span>
                <a href={object.share_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{object.share_url}</a>
              </div>
            )}
            {object.updated_at && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Updated At:</span>
                <span>{new Date(object.updated_at).toLocaleString()}</span>
              </div>
            )}
            {object.map_url && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Map URL:</span>
                <a href={object.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{object.map_url}</a>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-8">
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
        </CardContent>
      </Card>
    </div>
  );
} 