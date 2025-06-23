'use client';
import { Button } from '@/components/ui/button';
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
    role: 'admin' as const
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
    <div className='relative h-screen flex-col items-center justify-center lg:max-w-none lg:px-0'>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex min-w-64 flex-1 flex-col'
            >
              <h1 className='text-center text-2xl font-medium'>Sign Up</h1>
              <p className='text text-foreground text-center text-sm'>
                Already have an account?{' '}
                <Link
                  className='text-primary font-medium underline'
                  href='/auth/sign-in'
                >
                  Sign in
                </Link>
              </p>
              {message && (
                <div className={`mt-4 p-3 rounded-md ${
                  message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {message.text}
                </div>
              )}
              <div className='mt-8 flex flex-col gap-2 [&>input]:mb-3'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='mb-3'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Enter your email...'
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
                    <FormItem className='mb-3'>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter your password...'
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex gap-2'>
                  <FormField
                    control={form.control}
                    name='first_name'
                    render={({ field }) => (
                      <FormItem className='mb-3'>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            type='text'
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
                      <FormItem className='mb-3'>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            type='text'
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
                  name='role'
                  render={({ field }) => (
                    <FormItem className='mb-3'>
                      <FormLabel>Role</FormLabel>
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
                {form.watch('role') === 'guardian' && (
                  <FormField
                    control={form.control}
                    name='provider_id'
                    render={({ field }) => (
                      <FormItem className='mb-3'>
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
                )}
                <Button
                  disabled={loading}
                  className='mt-2 ml-auto w-full bg-blue-500'
                  type='submit'
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
