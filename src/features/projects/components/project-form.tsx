'use client';
import { FileUploader } from '@/components/file-uploader';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Project, ProjectStatus, Roles } from '@/constants/data';
import { useProject } from '@/hooks/use-project';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/utils/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Icons } from '@/components/icons';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ProjectStatusOptions = [
  { label: 'New', value: ProjectStatus.new },
  { label: 'In Progress', value: ProjectStatus.in_progress },
  { label: 'Completed', value: ProjectStatus.completed }
];

const formSchema = z.object({
  files: z
    .any()
    .refine(
      (files) => (files?.[0] ? files?.[0].size <= MAX_FILE_SIZE : true),
      `Max file size is 5MB.`
    )
    .refine(
      (files) =>
        files?.[0] ? ACCEPTED_IMAGE_TYPES.includes(files?.[0].type) : true,
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  title: z.string().min(2, {
    message: 'Project title must be at least 2 characters.'
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  created_by: z.string().nonempty('Creator id required').uuid(),
  assigned_designer: z.string().uuid().nullable().optional(),
  status: z.string().nonempty()
});

export default function ProjectForm({
  initialData,
  pageTitle
}: {
  initialData: Project | null;
  pageTitle: string;
}) {
  const CloseIcon = Icons.close;
  const { user: currentUser, profiles, fetchProfiles } = useUser();
  const { updateProject, addProject, selectProject } = useProject();
  const router = useRouter();

  const [saving, setSaving] = useState<boolean>(false);
  const [imageURLs, setImageURLs] = useState<string[]>(
    initialData?.files || []
  );

  const defaultValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    created_by: initialData?.created_by || '',
    assigned_designer: initialData?.assigned_designer || undefined,
    files: [],
    status: initialData?.status || ProjectStatus.new
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSaving(true);
    if (values.files && values.files.length) {
      const supabase = await createClient();
      const fileUrls = await Promise.all(
        values.files.map(async (file: File) => {
          const { data, error } = await supabase.storage
            .from('project-files')
            .upload(`${Date.now()}-${file.name}`, file);
          if (error) throw error;
          return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${data.path}`;
        })
      );
      values.files = imageURLs;
    }

    values.files.unshift(...imageURLs);

    if (!values.files.length) {
      form.setError('files', {
        message: 'Image required'
      });
      setSaving(false);
      return;
    }

    if (initialData) {
      await updateProject(initialData.id, values as Project)
        .then(() => {
          toast.success('Project is updated successfully!');
          router.push('/dashboard/project');
        })
        .catch((error) => {
          toast.error('Failed to update a project!');
          console.error(error);
        })
        .finally();
    } else {
      await addProject(values as Project)
        .then(() => {
          toast.success('Project is added successfully!');
          router.push('/dashboard/project');
        })
        .catch((error) => {
          toast.error('Failed to add a project!');
          console.error(error);
        });
    }
    setSaving(false);
  };

  const handleCancel = useCallback(() => {
    router.back();
    form.reset();
    selectProject(null);
  }, []);

  const designers = useMemo(() => {
    if (currentUser)
      profiles.push({
        id: currentUser.id,
        first_name: currentUser.user_metadata.first_name,
        last_name: currentUser.user_metadata.last_name,
        role: currentUser.user_metadata.role
      });

    return profiles.filter((profile) => profile.role === Roles.designer);
  }, [currentUser, profiles]);

  const isDeveloper = useMemo(
    () => currentUser?.user_metadata.role === Roles.designer,
    [currentUser]
  );

  useEffect(() => {
    if (currentUser && !initialData) {
      form.setValue('created_by', currentUser.id);
    }
  }, [currentUser, initialData, form]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {!isDeveloper && (
              <FormField
                control={form.control}
                name='files'
                render={({ field }) => (
                  <div className='space-y-6'>
                    <FormItem className='w-full'>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFiles={4}
                          maxSize={4 * 1024 * 1024}
                          // disabled={loading}
                          // progresses={progresses}
                          // pass the onUpload function here for direct upload
                          // onUpload={uploadFiles}
                          // disabled={isUploading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />
            )}
            {imageURLs.length > 0 &&
              imageURLs.map((imageURL, index) => (
                <Card
                  key={index}
                  className='relative flex h-32 w-32 items-center justify-center overflow-hidden'
                >
                  <Image
                    src={imageURL}
                    alt='Preview'
                    layout='fill'
                    objectFit='cover'
                    className='rounded-md'
                  />
                  {!isDeveloper && (
                    <Button
                      variant='destructive'
                      size='icon'
                      className='absolute top-1 right-1 h-6 w-6 rounded-full'
                      onClick={() =>
                        setImageURLs((items) =>
                          items.filter((item, idx) => idx !== index)
                        )
                      }
                    >
                      <CloseIcon />
                    </Button>
                  )}
                </Card>
              ))}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter project title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                disabled={isDeveloper}
              />
              <FormField
                control={form.control}
                name='assigned_designer'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Assigned Designer</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={initialData?.assigned_designer || undefined}
                      disabled={isDeveloper}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a designer' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {designers.map((designer) => (
                          <SelectItem
                            value={designer.id}
                            key={designer.id}
                            className='capitalize'
                          >
                            {`${designer.first_name} ${designer.last_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter product description'
                        className='resize-none'
                        {...field}
                        disabled={isDeveloper}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={initialData?.status || ProjectStatus.new}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ProjectStatusOptions.map((status) => (
                          <SelectItem
                            value={status.value}
                            key={status.value}
                            className='capitalize'
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex gap-4'>
              <Button onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button
                type='submit'
                onClick={form.handleSubmit(onSubmit)}
                disabled={saving}
              >
                {initialData ? 'Save' : 'Add Project'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
