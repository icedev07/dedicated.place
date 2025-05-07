import { createClient } from '@/utils/supabase/server';
import PaymentClient from '@/app/payment/[id]/payment-client';
import { notFound } from 'next/navigation';

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: object, error } = await supabase
    .from('objects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !object) {
    notFound();
  }

  return <PaymentClient object={object} />;
} 