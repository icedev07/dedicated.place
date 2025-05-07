import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';
import { useMemo } from 'react';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  const full_name = useMemo(() => {
    let metadata = user?.user_metadata;
    const { first_name, last_name } = metadata || {};
    return `${first_name || ''} ${last_name || ''}`.trim();
  }, [user]);

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={''} alt={full_name} />
        <AvatarFallback className='rounded-lg'>
          {full_name.slice(0, 2)?.toUpperCase() || 'CN'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{full_name || ''}</span>
          <span className='truncate text-xs'>{user?.email || ''}</span>
        </div>
      )}
    </div>
  );
}
