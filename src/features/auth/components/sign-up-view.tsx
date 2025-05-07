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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

const formSchema = z.object({
  email: z
    .string()
    .nonempty('Email required')
    .email({ message: 'Enter a valid email address' }),
  password: z.string().nonempty('Password required'),
  first_name: z.string().nonempty('First name required'),
  last_name: z.string().nonempty('Last name required'),
  role: z.string()
});

export type UserSignUpFormValue = z.infer<typeof formSchema>;

export default function SignUpViewPage() {
  const { getCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);

  const defaultValues = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: Roles.designer
  };

  const form = useForm<UserSignUpFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserSignUpFormValue) => {
    setLoading(true);
    await signUpAction(data);
    await getCurrentUser();
    setLoading(false);
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
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl className='w-full'>
                          <SelectTrigger className='capitalize'>
                            <SelectValue placeholder='Select a role' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value={Roles.client}
                            className='capitalize'
                          >
                            {Roles.client}
                          </SelectItem>
                          <SelectItem
                            value={Roles.designer}
                            className='capitalize'
                          >
                            {Roles.designer}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
