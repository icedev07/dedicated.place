'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js/pure';
import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Edit3 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Object {
  id: string;
  title_de: string;
  description_de: string;
  price: number;
  image_urls?: string[];
  location_text?: string;
  plaque_allowed?: boolean;
  plaque_max_chars?: number;
}

export default function PaymentClient({ object }: { object: Object }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectId: object.id,
          amount: object.price,
        }),
      });

      const { clientSecret } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error } = await stripe.confirmPayment({
        elements: undefined,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-sm">
      <Card className="overflow-hidden">
        {/* Object Image */}
        {object.image_urls && object.image_urls.length > 0 ? (
          <div className="relative w-full h-60">
            <Image
              src={object.image_urls[0]}
              alt={object.title_de || 'Object image'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-60 bg-gray-100 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <CardHeader className="text-center">
          <CardTitle>{object.title_de}</CardTitle>
          <CardDescription>{object.description_de}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price */}
          <div className="flex justify-center items-center text-3xl font-bold">
            €{object.price}
          </div>

          {/* Additional Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Location */}
            {object.location_text && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{object.location_text}</span>
              </div>
            )}

            {/* Plaque Info */}
            {object.plaque_allowed && (
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                <span>Plaque possible ({object.plaque_max_chars || 'max chars not specified'})</span>
              </div>
            )}
            {/* Add other relevant details here if needed */}
          </div>

          {/* Pay Now Button */}
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 