'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { ObjectsTable } from '@/components/objects/ObjectsTable';
import { ObjectsPagination } from '@/components/objects/ObjectsPagination';
import { DeleteDialog } from '@/components/objects/DeleteDialog';
import { SuccessAlert } from '@/components/objects/SuccessAlert';
import { PublicObject } from '@/types/public-object';
import { Button } from '@/components/ui/button';

export default function ProvidersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [objects, setObjects] = useState<PublicObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchObjects = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('objects')
        .select('*', { count: 'exact' });

      if (debouncedSearch) {
        query = query.ilike('title_de', `%${debouncedSearch}%`);
      }

      const { count } = await query.range(0, 0);
      setTotalCount(count || 0);

      const { data } = await query
        .range((page - 1) * rowsPerPage, page * rowsPerPage - 1);

      setObjects(data || []);
    } catch (error) {
      setObjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;
  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) return pageNumbers;
    const halfMax = Math.floor(maxVisiblePages / 2);
    let start = Math.max(page - halfMax, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    return pageNumbers.slice(start - 1, end);
  };

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-4">Public Objects</h1>
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full max-w-md"
          />
        </div>
        <Button onClick={() => router.push('/providers/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Object
        </Button>
      </div>
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}
      <ObjectsTable
        objects={objects}
        loading={loading}
        onEdit={id => router.push(`/providers/${id}`)}
        onDelete={id => setDeleteId(id)}
      />
      <ObjectsPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        getVisiblePageNumbers={getVisiblePageNumbers}
      />
      <DeleteDialog
        open={!!deleteId}
        loading={deleteLoading}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          setDeleteLoading(true);
          const supabase = createClient();
          await supabase.from("objects").delete().eq("id", deleteId!);
          setDeleteLoading(false);
          setDeleteId(null);
          setSuccess("Object deleted successfully.");
          fetchObjects();
        }}
      />
    </div>
  );
}
