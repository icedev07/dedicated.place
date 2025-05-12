// src/app/providers/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('objects')
          .select('*', { count: 'exact', head: true });

        setTotalCount(count || 0);

        const { data } = await supabase
          .from('objects')
          .select('*')
          .range((page - 1) * rowsPerPage, page * rowsPerPage - 1);

        setObjects(data || []);
      } catch (error) {
        console.error('Error:', error);
        setObjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
  }, [page, rowsPerPage]);

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

  console.log('objects', objects);

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-4">Public Objects</h1>
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