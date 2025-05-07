import { ReactElement } from 'react';

interface Object {
  id: string;
  title_de: string;
  description_de: string;
  latitude: number;
  longitude: number;
}

declare module '@/app/home/home-client' {
  const HomeClient: ({ objects }: { objects: Object[] }) => ReactElement;
  export default HomeClient;
} 