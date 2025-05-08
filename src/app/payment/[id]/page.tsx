import { createClient } from '@/utils/supabase/server';
import PaymentClient from '@/app/payment/[id]/payment-client';
import { notFound } from 'next/navigation';


type PageProps = { params: Promise<{ id: string }> };

// export default async function PaymentPage({ params }: { params: { id: string } }) {
export default async function PaymentPage(props: PageProps) {
  const supabase = await createClient();

  const params = await props.params;
  
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