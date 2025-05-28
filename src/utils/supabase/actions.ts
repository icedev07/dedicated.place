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

  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      console.error('Auth error:', authError);
      return {
        error: true,
        message: authError.message
      };
    }

    if (!authData.user) {
      return {
        error: true,
        message: 'Failed to create user account'
      };
    }

    // Wait a short moment to ensure the auth user is fully created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create profile record with all required fields
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Set admin-specific fields
        admin_permissions: formData.role === 'admin' ? ['all'] : [],
        // Set guardian-specific fields if role is guardian
        guardian_status: formData.role === 'guardian' ? 'pending' : null,
        guardian_region: formData.role === 'guardian' ? null : null,
        guardian_notes: formData.role === 'guardian' ? null : null,
        guardian_rating: formData.role === 'guardian' ? 0 : null,
        guardian_reports_count: formData.role === 'guardian' ? 0 : null,
        // Set provider-specific fields if role is provider
        company_name: formData.role === 'provider' ? null : null,
        company_address: formData.role === 'provider' ? null : null,
        company_website: formData.role === 'provider' ? null : null,
        company_logo: formData.role === 'provider' ? null : null,
        company_description: formData.role === 'provider' ? null : null,
        company_contact_email: formData.role === 'provider' ? null : null,
        company_contact_phone: formData.role === 'provider' ? null : null,
        // Set default values for common fields
        phone: null,
        avatar_url: null,
        last_login: null
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        error: true,
        message: 'Failed to create user profile: ' + profileError.message
      };
    }

    // Set session
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || ''
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return {
        error: true,
        message: 'Failed to set session: ' + sessionError.message
      };
    }

    return {
      error: false,
      message: 'Thanks for signing up! Please check your email for a verification link.'
    };
  } catch (error) {
    console.error('Error during signup:', error);
    return {
      error: true,
      message: 'An unexpected error occurred during signup'
    };
  }
};

export const signInAction = async (data: SignInWithPasswordCredentials) => {
  const supabase = await createClient();

  // Sign in the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword(data);

  if (authError) {
    return {
      error: true,
      message: authError.message
    };
  }

  if (authData.user) {
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return {
          error: true,
          message: 'Failed to fetch user profile'
        };
      }

      if (profile) {
        // Update user metadata with profile data
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role
          }
        });

        if (updateError) {
          console.error('User metadata update error:', updateError);
        }

        // Set session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authData.session?.access_token || '',
          refresh_token: authData.session?.refresh_token || ''
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          return {
            error: true,
            message: 'Failed to set session'
          };
        }
      }
    } catch (error) {
      console.error('Error during signin:', error);
      return {
        error: true,
        message: 'An unexpected error occurred'
      };
    }
  }

  revalidatePath('/', 'layout');
  return {
    error: false,
    message: 'Successfully signed in'
  };
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/auth/sign-in');
};
