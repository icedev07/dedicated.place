'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

interface UserTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function UserTable<TData, TValue>({
  columns,
  data
}: UserTableProps<TData, TValue>) {
  return (
    <div className="rounded-md border">
      <DataTable columns={columns} data={data} />
    </div>
  );
} 