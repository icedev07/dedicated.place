import { createClient } from '@/utils/supabase/server';
import { UserTable } from '@/components/admin/users/user-table';
import { columns } from '@/components/admin/users/columns';

export default async function UsersPage() {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <UserTable data={users} columns={columns} />
    </div>
  );
} 