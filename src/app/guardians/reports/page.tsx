'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { GuardianReport } from '@/types/guardian-report';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export default function GuardianReportsPage() {
  const [reports, setReports] = useState<GuardianReport[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('guardian_reports')
        .select(`
          *,
          objects (
            id,
            title_en,
            title_de
          )
        `)
        .eq('guardian_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Guardian Reports</h1>
        <Button onClick={() => router.push('/guardians/reports/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
} 