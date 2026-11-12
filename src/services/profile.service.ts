import { api } from "./api";

import type {
  ApiResponse,
  ChangePasswordPayload,
  CollectorProfile,
  UpdateProfilePayload,
} from "../types/api";

export const profileService = {
  async getProfile(): Promise<CollectorProfile> {
    const response = await api.get<ApiResponse<CollectorProfile>>("/profile");

    return response.data.data;
  },

  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<CollectorProfile> {
    const response = await api.patch<ApiResponse<CollectorProfile>>(
      "/profile",
      payload,
    );

    return response.data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.patch<ApiResponse<null>>("/profile/password", payload);
  },
};