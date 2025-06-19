// src/app/guardians/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PlusCircle } from 'lucide-react';
import { GuardianReport } from '@/types/guardian-report';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './reports/columns';

export default function GuardiansPage() {
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
      // if (!user) {
      //   router.push('/auth/sign-in');
      //   return;
      // }

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
        // .eq('guardian_id', user.id)
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
    <div className="container mx-auto py-16">
      <div className="mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="h-16 mb-4" />
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to the Guardians Page</h2>
          <p className="text-muted-foreground">Park Guardians can submit reports, upload photos, and earn points for helping maintain public spaces. Use the table below to view and manage your reports.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports
            </CardTitle>
            <Button onClick={() => router.push('/guardians/reports/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={reports}
              loading={loading}
              filterColumn="object_title"
              filterPlaceholder="Filter by object name..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}