import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";

export function useAuth() {
  const { user, loading } = useSupabaseAuth();

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
  };
}
