import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  return (
    <div>
      <div className='flex justify-end p-4'>
        <ModeToggle />
      </div>
      <SignInViewPage />
    </div>
  );
}
