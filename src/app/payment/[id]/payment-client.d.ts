import { ReactElement } from 'react';

interface Object {
  id: string;
  title_de: string;
  description_de: string;
  price: number;
}

declare module '@/app/payment/[id]/payment-client' {
  const PaymentClient: ({ object }: { object: Object }) => ReactElement;
  export default PaymentClient;
} 