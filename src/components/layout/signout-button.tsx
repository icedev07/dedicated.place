import { signOutAction } from '@/utils/supabase/actions';
import { Button } from '../ui/button';

export const SignOutButton = () => {
  return (
    <Button
      type='button'
      variant='ghost'
      onClick={signOutAction}
      className='size-8 rounded-full'
    >
      Sign out
    </Button>
  );
};
