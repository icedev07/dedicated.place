import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, FileText, Euro } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch statistics
  const [
    { count: usersCount },
    // { count: providersCount },
    { count: objectsCount },
    { count: reportsCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    // supabase.from('providers').select('*', { count: 'exact', head: true }),
    supabase.from('objects').select('*', { count: 'exact', head: true }),
    supabase.from('guardian_reports').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    {
      title: 'Total Users',
      value: usersCount || 0,
      icon: Users,
      description: 'Registered users'
    },
    // {
    //   title: 'Providers',
    //   value: providersCount || 0,
    //   icon: Building2,
    //   description: 'Active providers'
    // },
    {
      title: 'Objects',
      value: objectsCount || 0,
      icon: FileText,
      description: 'Sponsorable items'
    },
    {
      title: 'Reports',
      value: reportsCount || 0,
      icon: FileText,
      description: 'Guardian reports'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 