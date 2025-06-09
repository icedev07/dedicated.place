'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js/pure';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// New constants
const PAYMENT_MODE = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'; // Placeholder, actual mode based on Stripe keys

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

// New component for the payment form
function CheckoutForm({ object, clientSecret }: { object: Object, clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessUrl, setPaymentSuccessUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPaymentSuccessUrl(`${window.location.origin}/payment/success`);
    }
  }, []);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentSuccessUrl) {
      // Stripe.js has not yet loaded or paymentSuccessUrl is not set.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    setPaymentError(null);
    setShowConfirmDialog(true);
  };

  const handleConfirmAndPay = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    if (!stripe || !elements || !paymentSuccessUrl) {
      setPaymentError("Stripe is not fully loaded. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await stripe!.confirmPayment({
        elements: elements!,
        confirmParams: {
          return_url: paymentSuccessUrl,
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setPaymentError(error.message || "An unexpected error occurred.");
          window.alert(`Payment failed: ${error.message || "An unexpected error occurred."}`);
        } else {
          setPaymentError("An unexpected error occurred.");
          window.alert("Payment failed: An unexpected error occurred.");
        }
      } else {
        // Payment successful (or pending, if return_url handles it)
        window.alert("Payment successful!");
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentError("An unexpected error occurred during payment.");
      window.alert("Payment failed: An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <PaymentElement />
        {paymentError && <div className="text-red-500 text-sm mt-2">{paymentError}</div>}
        <Button
          type="submit"
          disabled={!stripe || !elements || loading || !paymentSuccessUrl}
          className="w-full bg-green-700 hover:bg-green-800 text-white"
        >
          {loading ? 'Processing...' : `Pay €${object.price}`}
        </Button>
      </CardContent>

      {/* Confirmation Dialog for payment */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed with the payment for {object.title_de}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAndPay} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}


export default function PaymentClient({ object }: { object: Object }) {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleInitiatePayment = async () => {
    setLoading(true);
    try {
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

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      } else {
        throw new Error('Failed to retrieve client secret');
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      // Optionally, show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // This function can be used to navigate or show success message after payment
    // For now, Stripe's return_url handles redirection.
  }

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

        {!showPaymentForm ? (
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
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </CardContent>
        ) : (
          clientSecret && stripePromise ? (
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <CheckoutForm object={object} clientSecret={clientSecret} />
            </Elements>
          ) : (
            <CardContent>
              <div className="text-center text-gray-500">Loading payment form...</div>
            </CardContent>
          )
        )}
      </Card>
    </div>
  );
} 