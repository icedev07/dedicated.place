'use client';
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
import { Separator } from '@/components/ui/separator';
import { Roles } from '@/constants/data';
import { useUser } from '@/hooks/use-user';
import { signUpAction } from '@/utils/supabase/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { ImageUpload } from '@/components/ui/image-upload';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

const formSchema = z.object({
  email: z
    .string()
    .nonempty('Email required')
    .email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .nonempty('Password required')
    .min(8, 'Password must be at least 8 characters'),
  first_name: z
    .string()
    .nonempty('First name required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: z
    .string()
    .nonempty('Last name required')
    .min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'provider', 'guardian'], {
    required_error: 'Please select a role'
  }),
  provider_id: z.string().optional(),
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  company_description: z.string().optional(),
  company_contact_email: z.string().optional(),
  company_contact_phone: z.string().optional(),
  company_logo: z.string().optional(),
}).refine((data) => {
  if (data.role === 'provider') {
    return (
      data.company_name &&
      data.company_address &&
      data.company_description &&
      data.company_contact_email &&
      data.company_contact_phone &&
      data.company_logo
    );
  }
  return true;
}, {
  message: 'All company fields are required for providers',
  path: [
    'company_name',
    'company_address',
    'company_description',
    'company_contact_email',
    'company_contact_phone',
    'company_logo',
  ],
});

export type UserSignUpFormValue = z.infer<typeof formSchema>;

export default function SignUpViewPage() {
  const { getCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [providers, setProviders] = useState<{ id: string; first_name: string; last_name: string; email: string }[]>([]);

  const defaultValues = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'admin' as const,
    company_name: '',
    company_address: '',
    company_description: '',
    company_contact_email: '',
    company_contact_phone: '',
    company_logo: '',
  };

  const form = useForm<UserSignUpFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    // Fetch providers for guardian role
    const fetchProviders = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, first_name, last_name, email').eq('role', 'provider');
      setProviders(data || []);
    };
    fetchProviders();
  }, []);

  const onSubmit = async (data: UserSignUpFormValue) => {
    try {
      setLoading(true);
      setMessage(null);
      const result = await signUpAction(data);
      
      if (result.error) {
        setMessage({ type: 'error', text: result.message });
      } else {
        setMessage({ type: 'success', text: result.message });
        await getCurrentUser();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 lg:p-8'>
      <Card className='w-full max-w-2xl'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Create Account</CardTitle>
          <p className='text-muted-foreground'>
            Already have an account?{' '}
            <Link
              className='text-primary font-medium underline'
              href='/auth/sign-in'
            >
              Sign in
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Basic Information</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='first_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='First name'
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='last_name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Last name'
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Enter your email'
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter your password'
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Role Selection */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Role Selection</h3>
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Role</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select role' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='admin'>Admin</SelectItem>
                            <SelectItem value='provider'>Provider</SelectItem>
                            <SelectItem value='guardian'>Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Fields */}
              {form.watch('role') === 'guardian' && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Guardian Information</h3>
                    <FormField
                      control={form.control}
                      name='provider_id'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Provider</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={loading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select provider' />
                              </SelectTrigger>
                              <SelectContent>
                                {providers.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.first_name} {provider.last_name} ({provider.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {form.watch('role') === 'provider' && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Company Information</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='company_name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Company name'
                                disabled={loading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='company_contact_phone'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Contact phone'
                                disabled={loading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name='company_address'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Company address'
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='company_contact_email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              type='email'
                              placeholder='Contact email'
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='company_description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Company description'
                              disabled={loading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='company_logo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Logo</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value ? [field.value] : []}
                              onChange={(urls) => field.onChange(urls[0] || '')}
                              onRemove={() => field.onChange('')}
                              folder="company-logos"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <Button
                type='submit'
                disabled={loading}
                className='w-full'
                size='lg'
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
