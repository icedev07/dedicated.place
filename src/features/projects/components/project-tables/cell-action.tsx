'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Project, Roles } from '@/constants/data';
import { useProject } from '@/hooks/use-project';
import { useUser } from '@/hooks/use-user';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Project;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const { selectedProject, selectProject, deleteProject } = useProject();
  const { user: currentUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const isDeveloper = useMemo(
    () => currentUser?.user_metadata.role === Roles.designer,
    [currentUser]
  );

  const onConfirm = async () => {
    if (!selectedProject) return;
    setLoading(true);
    await deleteProject(selectedProject.id)
      .then(() => {
        toast.success('Project is removed successfully!');
      })
      .catch((error) => {
        toast.error('Failed to delete a project');
        console.error(error);
      })
      .finally(() => {
        selectProject(null);
        setLoading(false);
        setOpen(false);
      });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              selectProject(data);
              router.push(`/dashboard/project/${data.id}`);
            }}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Update
          </DropdownMenuItem>
          {!isDeveloper && (
            <DropdownMenuItem
              onClick={() => {
                selectProject(data);
                setOpen(true);
              }}
            >
              <IconTrash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
