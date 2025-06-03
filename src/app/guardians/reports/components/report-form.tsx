'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { GuardianReport } from '@/types/guardian-report';
import { toast } from 'sonner';

const formSchema = z.object({
  object_id: z.number({
    required_error: 'Please select an object',
  }),
  status_type: z.enum(['ok', 'damaged', 'needs_repair', 'other'], {
    required_error: 'Please select a status',
  }),
  status_note: z.string().optional(),
  location_text: z.string().optional(),
  is_public: z.boolean().default(false),
  image_urls: z.array(z.string()).default([]),
});

interface ReportFormProps {
  initialData?: GuardianReport;
  isEditing?: boolean;
}

export function ReportForm({ initialData, isEditing }: ReportFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState<Array<{ id: number; title_en: string | null }>>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      object_id: initialData?.object_id,
      status_type: initialData?.status_type || 'ok',
      status_note: initialData?.status_note || '',
      location_text: initialData?.location_text || '',
      is_public: initialData?.is_public || false,
      image_urls: initialData?.image_urls || [],
    },
  });

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async () => {
    try {
      const { data, error } = await supabase
        .from('objects')
        .select('id, title_en')
        .order('title_en');

      if (error) throw error;
      setObjects(data || []);
    } catch (error) {
      console.error('Error fetching objects:', error);
      toast.error('Failed to load objects');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const reportData = {
        ...values,
        guardian_id: user.id,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from('guardian_reports')
          .update(reportData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Report updated successfully');
      } else {
        const { error } = await supabase
          .from('guardian_reports')
          .insert([reportData]);

        if (error) throw error;
        toast.success('Report created successfully');
      }

      router.push('/guardians/reports');
      router.refresh();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="object_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Object</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an object" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {objects.map((object) => (
                    <SelectItem key={object.id} value={object.id.toString()}>
                      {object.title_en || `Object ${object.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="needs_repair">Needs Repair</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status_note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a note about the status"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter location details"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Report</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this report visible to the public
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Image Upload Field */}
        <FormField
          control={form.control}
          name="image_urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={(url) => form.setValue('image_urls', field.value.filter(image_url => image_url !== url))}
                  folder="guardian_reports"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Report' : 'Create Report'}
        </Button>
      </form>
    </Form>
  );
} 