import { api, type UpdateProfileRequest, type User } from "@/lib/api";

export const profileApi = {
  getMe: (token: string): Promise<{ data: User }> => api.getMe(token),
  updateProfile: (token: string, payload: UpdateProfileRequest): Promise<{ message: string; data: User }> =>
    api.updateProfile(token, payload),
};
