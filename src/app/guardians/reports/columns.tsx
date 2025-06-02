'use client';

import { ColumnDef } from '@tanstack/react-table';
import { GuardianReport } from '@/types/guardian-report';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ReportActionsProps {
  report: GuardianReport;
}

function ReportActions({ report }: ReportActionsProps) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => router.push(`/guardians/reports/${report.id}/edit`)}
        >
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<GuardianReport>[] = [
  {
    accessorKey: 'objects.title_en',
    id: 'object_title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Object
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const object = row.original.objects;
      return object?.title_en || `Object ${object?.id}`;
    },
  },
  {
    accessorKey: 'status_type',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status_type') as string;
      return (
        <div className="capitalize">
          {status.replace('_', ' ')}
        </div>
      );
    },
  },
  {
    accessorKey: 'status_note',
    header: 'Note',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      return format(new Date(row.getValue('created_at')), 'PPp');
    },
  },
  {
    accessorKey: 'approved',
    header: 'Approved',
    cell: ({ row }) => {
      return row.getValue('approved') ? 'Yes' : 'No';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return <ReportActions report={row.original} />;
    },
  },
]; 