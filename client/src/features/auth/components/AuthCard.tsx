import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, ArrowRight, RefreshCw, KeyRound, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { type User } from "@/lib/api";
import { useSendOtp, useVerifyOtp } from "../hooks/useAuth";

const emailSchema = z.object({
  identifier: z.string().min(1, "Email address is required").email("Invalid email format"),
});

const phoneSchema = z.object({
  identifier: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid phone number (e.g. +12345678901)"),
});

const otpSchema = z.object({
  code: z.string().length(6, "OTP code must be exactly 6 digits"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

interface AuthCardProps {
  onSuccess: (token: string, user: User, isNewUser: boolean) => void;
}

export function AuthCard({ onSuccess }: AuthCardProps) {
  const [authType, setAuthType] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [step, setStep] = useState<"SEND" | "VERIFY">("SEND");
  const [activeIdentifier, setActiveIdentifier] = useState<string>("");
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  const [resendTimer, setResendTimer] = useState(0);

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { identifier: "" },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { identifier: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = (identifier: string, type: "EMAIL" | "PHONE") => {
    sendOtpMutation.mutate(
      { identifier, type },
      {
        onSuccess: (response) => {
          setActiveIdentifier(identifier);
          setDevCode(response.data.code);
          setStep("VERIFY");
          setResendTimer(30);
          toast.success(response.message || `OTP sent to ${identifier}`);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to send OTP");
        },
      }
    );
  };

  const handleVerifyOtp = (values: OtpFormValues) => {
    verifyOtpMutation.mutate(
      {
        identifier: activeIdentifier,
        code: values.code,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Authentication successful!");
          onSuccess(response.token, response.data, response.isNewUser);
        },
        onError: (error: any) => {
          toast.error(error.message || "Verification failed");
        },
      }
    );
  };

  const handleResend = () => {
    if (resendTimer === 0 && activeIdentifier) {
      handleSendOtp(activeIdentifier, authType);
    }
  };

  const handleResetStep = () => {
    setStep("SEND");
    otpForm.reset({ code: "" });
    setDevCode(undefined);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border border-border/40 backdrop-blur-xl bg-card/80 transition-all duration-300">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {step === "SEND" ? "Welcome Back" : "Security Verification"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {step === "SEND"
            ? "Sign in or create an account using passwordless OTP"
            : `Enter the 6-digit code sent to ${activeIdentifier}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "SEND" ? (
          <Tabs
            defaultValue="EMAIL"
            value={authType}
            onValueChange={(val) => setAuthType(val as "EMAIL" | "PHONE")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="EMAIL" className="gap-2">
                <Mail className="size-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="PHONE" className="gap-2">
                <Phone className="size-4" />
                Mobile Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="EMAIL">
              <form
                onSubmit={emailForm.handleSubmit((values) =>
                  handleSendOtp(values.identifier, "EMAIL")
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9"
                      {...emailForm.register("identifier")}
                    />
                  </div>
                  {emailForm.formState.errors.identifier && (
                    <p className="text-xs text-destructive font-medium">
                      {emailForm.formState.errors.identifier.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <>
                      Send Email OTP
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="PHONE">
              <form
                onSubmit={phoneForm.handleSubmit((values) =>
                  handleSendOtp(values.identifier, "PHONE")
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+12345678901"
                      className="pl-9"
                      {...phoneForm.register("identifier")}
                    />
                  </div>
                  {phoneForm.formState.errors.identifier && (
                    <p className="text-xs text-destructive font-medium">
                      {phoneForm.formState.errors.identifier.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <>
                      Send SMS OTP
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                One-Time Security Code
              </Label>

              <InputOTP
                maxLength={6}
                value={otpForm.watch("code")}
                onChange={(val) => otpForm.setValue("code", val)}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="size-11 text-lg font-semibold rounded-md border" />
                  <InputOTPSlot index={1} className="size-11 text-lg font-semibold rounded-md border" />
                  <InputOTPSlot index={2} className="size-11 text-lg font-semibold rounded-md border" />
                  <InputOTPSlot index={3} className="size-11 text-lg font-semibold rounded-md border" />
                  <InputOTPSlot index={4} className="size-11 text-lg font-semibold rounded-md border" />
                  <InputOTPSlot index={5} className="size-11 text-lg font-semibold rounded-md border" />
                </InputOTPGroup>
              </InputOTP>

              {otpForm.formState.errors.code && (
                <p className="text-xs text-destructive font-medium">
                  {otpForm.formState.errors.code.message}
                </p>
              )}
            </div>

            {devCode && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500 animate-pulse" />
                  <span>Dev Mode OTP: <strong className="font-mono text-sm tracking-widest">{devCode}</strong></span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-amber-500/20"
                  onClick={() => otpForm.setValue("code", devCode)}
                >
                  Auto-fill
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <>
                  Verify Code & Continue
                  <CheckCircle2 className="size-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-xs pt-2">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-muted-foreground hover:text-foreground"
                onClick={handleResetStep}
              >
                ← Change {authType.toLowerCase()}
              </Button>

              <Button
                type="button"
                variant="link"
                disabled={resendTimer > 0 || isLoading}
                onClick={handleResend}
                className="p-0 h-auto"
              >
                {resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="size-3" /> Resend OTP
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-border/40 pt-4 text-xs text-muted-foreground gap-1">
        <KeyRound className="size-3 text-primary" />
        <span>Passwordless authentication powered by JWT</span>
      </CardFooter>
    </Card>
  );
}
