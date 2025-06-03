'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ReportForm } from '../../components/report-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GuardianReport } from '@/types/guardian-report';
import { toast } from 'sonner';

export default function EditReportPage() {
  const [report, setReport] = useState<GuardianReport | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

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
        .eq('id', id)
        .eq('guardian_id', user.id)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error('Report not found');
        router.push('/guardians/reports');
        return;
      }

      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
      router.push('/guardians/reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm
            initialData={report}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
} 