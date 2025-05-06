
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { loginUser } from '@/utils/auth';
import AuthContext from './AuthContext';
import { Profile } from './types';
import { fetchUserProfile, updateUserProfile } from './profileUtils';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profileData = await fetchUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleProfileFetch = async (userId: string) => {
    try {
      const profileData = await fetchUserProfile(userId);
      if (profileData) {
        setProfile(profileData);

        // Redirect based on role if not already on the correct route
        if (!window.location.pathname.includes(`/${profileData.role}`)) {
          navigate(`/${profileData.role}`);
        }
      }
    } catch (error) {
      console.error('Error in handleProfileFetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        
        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(() => {
          handleProfileFetch(session.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        navigate('/');
      }
    });

    // THEN check for existing session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      if (data?.session) {
        console.log('Existing session found:', data.session.user.id);
        setUser(data.session.user);
        await handleProfileFetch(data.session.user.id);
      } else {
        console.log('No existing session found');
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, [navigate]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const success = await updateUserProfile(user.id, updates);
      if (success) {
        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates } : prev);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      console.log('Signing in with:', identifier);
      const { data, error } = await loginUser(identifier, password);

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data && data.user) {
        console.log('Sign in successful:', data.user.id);
        setUser(data.user);
        // Since onAuthStateChange will handle the redirect, we don't need to duplicate that logic here
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
