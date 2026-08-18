import { api, type SendOtpRequest, type SendOtpResponse, type VerifyOtpRequest, type VerifyOtpResponse } from "@/lib/api";

export const authApi = {
  sendOtp: (payload: SendOtpRequest): Promise<SendOtpResponse> => api.sendOtp(payload),
  verifyOtp: (payload: VerifyOtpRequest): Promise<VerifyOtpResponse> => api.verifyOtp(payload),
};
