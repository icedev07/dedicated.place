// src/app/providers/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PublicObject {
  id: string;
  title_de: string;
  description_de: string;
  created_at: string;
}

export default function ProvidersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [objects, setObjects] = useState<PublicObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

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
      console.error('Error:', error);
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
      
      <div className="mb-6">
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
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {objects.map((object) => (
                <tr key={object.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{object.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{object.title_de || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{object.description_de || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {object.created_at ? new Date(object.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              {getVisiblePageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 border rounded ${page === pageNum ? 'bg-blue-500 text-white' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}