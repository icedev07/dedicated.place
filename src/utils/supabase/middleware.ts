import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Get authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (user) {
      // Fetch and update profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        // Update user metadata with profile data
        await supabase.auth.updateUser({
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role
          }
        });
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return response;
}
