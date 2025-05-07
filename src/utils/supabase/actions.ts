'use server';

import { UserSignUpFormValue } from '@/features/auth/components/sign-up-view';
import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const signUpAction = async (formData: UserSignUpFormValue) => {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role
      }
    }
  });

  if (error) {
    console.error(error.code + ' ' + error.message);
    return encodedRedirect('error', '/auth/sign-up', error.message);
  } else {
    return encodedRedirect(
      'success',
      '/auth/sign-up',
      'Thanks for signing up! Please check your email for a verification link.'
    );
  }
};

export const signInAction = async (data: SignInWithPasswordCredentials) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return encodedRedirect('error', '/auth/sign-in', error.message);
  }

  revalidatePath('/', 'layout');
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/auth/sign-in');
};
