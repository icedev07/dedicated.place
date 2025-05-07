'use client';
import { Project, ProjectStatus } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'files',
    header: 'IMAGE',
    cell: ({ row }) => {
      const images: string[] | undefined = row.getValue('files');
      const [photo_url] = images || [];
      return (
        <div className='relative aspect-square'>
          <Image
            src={photo_url || ''}
            alt={row.getValue('title')}
            fill
            className='rounded-lg'
          />
        </div>
      );
    }
  },
  {
    id: 'title',
    accessorKey: 'title',
    cell: ({ cell }) => <div>{cell.getValue<Project['title']>()}</div>
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    cell: ({ cell }) => (
      <div className=''>{cell.getValue<Project['description']>()}</div>
    )
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue<Project['status']>();
      let statusLabel = 'New';
      if (status === ProjectStatus.completed) statusLabel = 'Completed';
      else if (status === ProjectStatus.in_progress)
        statusLabel = 'In progress';
      return <div className=''>{statusLabel}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
