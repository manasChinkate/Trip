import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../services/profileApi";
import { type UpdateProfileRequest } from "@/lib/api";

export function useUserProfile(token: string | null) {
  return useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      if (!token) return null;
      const res = await profileApi.getMe(token);
      return res.data;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateProfile(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => {
      if (!token) throw new Error("Authentication token required");
      return profileApi.updateProfile(token, payload);
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["user", token] });
      }
    },
  });
}
