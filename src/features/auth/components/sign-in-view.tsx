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
import { useUser } from '@/hooks/use-user';
import { signInAction } from '@/utils/supabase/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Metadata } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  password: z.string().nonempty('Password required')
});

type UserFormValue = z.infer<typeof formSchema>;

export default function SignInViewPage() {
  const router = useRouter();
  const { getCurrentUser } = useUser();

  const [loading, setLoading] = useState(false);
  const defaultValues = {
    email: '',
    password: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    await signInAction({ email: data.email, password: data.password });
    await getCurrentUser();
    setLoading(false);
    router.push('/dashboard');
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
              <h1 className='text-center text-2xl font-medium'>Sign In</h1>
              <p className='text-foreground text-center text-sm'>
                {`Don't have an account?`}
                <Link
                  className='text-foreground font-medium underline'
                  href='/auth/sign-up'
                >
                  Sign up
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
                <Button
                  disabled={loading}
                  className='mt-2 ml-auto w-full bg-blue-500'
                  type='submit'
                >
                  Sign In
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
