'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface GuardianReport {
  id: string;
  guardian_id: string;
  object_id: number;
  status_note: string | null;
  status_type: 'ok' | 'damaged' | 'needs_repair' | 'other';
  image_urls: string[] | null;
  location_text: string | null;
  is_public: boolean;
  approved: boolean;
  created_at: string;
  updated_at: string;
  guardian?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  object?: {
    title_de: string;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reports, setReports] = useState<GuardianReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('guardian_reports')
        .select(`
          *,
          guardian:guardian_id(first_name, last_name, email),
          object:object_id(title_de)
        `, { count: 'exact' });

      if (debouncedSearch) {
        query = query.or(`location_text.ilike.%${debouncedSearch}%,status_note.ilike.%${debouncedSearch}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status_type', statusFilter);
      }

      const { count } = await query.range(0, 0);
      setTotalCount(count || 0);

      const { data } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * rowsPerPage, page * rowsPerPage - 1);

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleApprove = async (reportId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('guardian_reports')
        .update({ approved: true })
        .eq('id', reportId);
      fetchReports();
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      case 'needs_repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-4">Guardian Reports</h1>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by location or status note..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10 w-full"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="needs_repair">Needs Repair</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Object</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {report.guardian ? (
                      <div>
                        <div>{`${report.guardian.first_name} ${report.guardian.last_name}`}</div>
                        <div className="text-sm text-gray-500">{report.guardian.email}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>{report.object?.title_de || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(report.status_type)}>
                      {report.status_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.location_text || '-'}</TableCell>
                  <TableCell>{report.status_note || '-'}</TableCell>
                  <TableCell>
                    {report.image_urls && report.image_urls.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(report.image_urls![0], '_blank')}
                      >
                        View Images ({report.image_urls.length})
                      </Button>
                    ) : (
                      'No images'
                    )}
                  </TableCell>
                  <TableCell>
                    {!report.approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(report.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.ceil(totalCount / rowsPerPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(totalCount / rowsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
