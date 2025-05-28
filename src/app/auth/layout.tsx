import { UserProvider } from '@/contexts/user-context';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
} 