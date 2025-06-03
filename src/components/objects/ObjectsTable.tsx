import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { PublicObject } from "@/types/public-object";
import Image from "next/image";

interface ObjectsTableProps {
  objects: PublicObject[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ObjectsTable({ objects, loading, onEdit, onDelete }: ObjectsTableProps) {
  return (
    <div className="relative overflow-x-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-500" />
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {objects.map((object) => (
            <tr key={object.id}>
              <td className="px-6 py-4 text-sm">
                {object.image_urls && object.image_urls.length > 0 ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={object.image_urls[0]}
                      alt={object.title_de || 'Object image'}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{object.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{object.title_de || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{object.description_de || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {object.created_at ? new Date(object.created_at).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => window.open(`/providers/${object.id}`, '_blank')}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(object.id)}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
