'use client';

import { ReportForm } from '../components/report-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewReportPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>
    </div>
  );
} 