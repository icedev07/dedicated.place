'use client';
import { Profile, Roles } from '@/constants/data';
import { createClient } from '@/utils/supabase/client';
import {
  deleteProfileAction,
  updateProfileAction
} from '@/utils/supabase/profile-actions';
import { User } from '@supabase/supabase-js';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface UserContextType {
  user: User | null;
  loading: boolean;
  updating: boolean;
  profiles: Profile[];
  fetchProfiles: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (id: string, updatedProfile: Omit<Profile, 'id'>) => void;
  deleteProfile: (id: string) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const getCurrentUser = useCallback(async () => {
    try {
      console.log('------------- getCurrentUser: ', {});
      setLoading(true);
      const supabase = await createClient();
      const {
        data: { user: currentUser },
        error
      } = await supabase.auth.getUser();

      if (error) throw error;
      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select()
          .eq('id', currentUser.id)
          .single();

        if (error) throw error;

        if (profile) {
          currentUser.user_metadata['first_name'] = profile.first_name;
          currentUser.user_metadata['last_name'] = profile.last_name;
          currentUser.user_metadata['role'] = profile.role;
        }
      }

      setUser(currentUser);
    } catch (error) {
      toast.error('Failed to get the current user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      const supabase = await createClient();
      if (user?.user_metadata.role === Roles.admin) {
        const { data, error } = await supabase
          .from('profiles')
          .select()
          .neq('id', user.id);

        if (error) throw error;
        setProfiles(data as Profile[]);
      }
    } catch (error) {
      toast.error('Failed to fetch profiles list');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (id: string, data: Omit<Profile, 'id'>) => {
      try {
        setUpdating(true);
        const updatedProfile = await updateProfileAction(id, data);

        if (updatedProfile) {
          setProfiles((oldProfiles) =>
            oldProfiles.map((profile) =>
              profile.id === id ? updatedProfile : profile
            )
          );
        }
      } catch (error) {
        toast.error('Failed to update profile');
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  const deleteProfile = useCallback(async (id: string) => {
    try {
      setUpdating(true);
      const result = await deleteProfileAction(id);
      if (result)
        setProfiles((oldProfiles) =>
          oldProfiles.filter((item) => item.id !== id)
        );
    } catch (error) {
      toast.error('Failed to delete profile');
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        profiles,
        loading,
        updating,
        fetchProfiles,
        updateProfile,
        deleteProfile,
        getCurrentUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
