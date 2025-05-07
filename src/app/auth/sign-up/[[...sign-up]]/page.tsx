import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { FormMessage, Message } from '@/components/form-message';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  if ('success' in searchParams) {
    return (
      <div className='mx-auto flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md'>
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-end p-4'>
        <ModeToggle />
      </div>
      <SignUpViewPage />
    </div>
  );
}
