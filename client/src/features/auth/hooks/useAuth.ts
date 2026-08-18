import { useMutation } from "@tanstack/react-query";
import { authApi } from "../services/authApi";
import { type SendOtpRequest, type VerifyOtpRequest } from "@/lib/api";

export function useSendOtp() {
  return useMutation({
    mutationFn: (payload: SendOtpRequest) => authApi.sendOtp(payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpRequest) => authApi.verifyOtp(payload),
  });
}
