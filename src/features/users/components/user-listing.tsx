'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Profile, Roles } from '@/constants/data';
import { useUser } from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Column, ColumnDef } from '@tanstack/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { UserTable } from './user-tables';
import { ProfileAction } from './user-tables/cell-action';

const formSchema = z.object({
  first_name: z.string().nonempty('First name required'),
  last_name: z.string().nonempty('Last name required'),
  role: z.string().nonempty('Role required')
});

const defaultValues = {
  first_name: '',
  last_name: '',
  role: Roles.designer
};

export type ProfileFormValue = z.infer<typeof formSchema>;

export default function UserListPage({}) {
  const { profiles, updating, updateProfile, fetchProfiles, deleteProfile } =
    useUser();

  const [selectedProfile, selectProfile] = useState<Profile | null>(null);

  const form = useForm<ProfileFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    form.setValue('first_name', selectedProfile?.first_name || '');
    form.setValue('last_name', selectedProfile?.last_name || '');
    form.setValue('role', selectedProfile?.role || '');
  }, [selectedProfile, form]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const onSubmit = async (data: ProfileFormValue) => {
    if (selectedProfile) {
      try {
        updateProfile(selectedProfile.id, data as Profile);
        toast.success('Profile is updated successfully!');
        selectProfile(null);
      } catch (error) {
        toast.error('Failed to update profile!');
        console.error(error);
      }
    }
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
  };

  const cancelUpdate = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    selectProfile(null);
  }, []);

  const columns: ColumnDef<Profile>[] = [
    {
      id: 'name',
      header: ({ column }: { column: Column<Profile, unknown> }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => {
        if (selectedProfile?.id !== row.original.id) {
          const full_name =
            `${row.original.first_name} ${row.original.last_name}`.trim();
          return <div>{full_name}</div>;
        }

        return (
          <Form {...form}>
            <div className='flex gap-2'>
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type='text' disabled={updating} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type='text' disabled={updating} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        );
      }
    },
    {
      id: 'role',
      accessorKey: 'role',
      cell: ({ cell, row }) =>
        selectedProfile?.id === row.original.id ? (
          <Form {...form}>
            <FormField
              {...form.register('role')}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={selectedProfile?.role || Roles.designer}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger className='capitalize'>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Roles.client} className='capitalize'>
                        {Roles.client}
                      </SelectItem>
                      <SelectItem value={Roles.designer} className='capitalize'>
                        {Roles.designer}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </Form>
        ) : (
          <div className='capitalize'>{cell.getValue<Profile['role']>()}</div>
        )
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        selectedProfile?.id === row.original.id ? (
          <div className='flex w-full justify-end gap-2'>
            <Button onClick={cancelUpdate} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={updating}>
              Save
            </Button>
          </div>
        ) : (
          <div className='flex w-full justify-end'>
            <ProfileAction
              data={row.original}
              onDelete={handleDeleteProfile}
              onUpdate={selectProfile}
            />
          </div>
        )
    }
  ];

  return (
    <UserTable data={profiles} totalItems={profiles.length} columns={columns} />
  );
}
