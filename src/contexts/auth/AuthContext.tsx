
import React, { createContext, useContext } from 'react';
import { AuthContextType, Profile } from './types';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Export the AuthContext for the provider
export default AuthContext;
