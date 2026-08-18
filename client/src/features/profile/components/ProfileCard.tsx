import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Hash, Image, Save, LogOut, CheckCircle2, ShieldCheck, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type User } from "@/lib/api";
import { profileSchema, type ProfileFormValues } from "../schema/profileSchema";
import { useUpdateProfile } from "../hooks/useProfile";

interface ProfileCardProps {
  user: User;
  token: string;
  isNewUser?: boolean;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

export function ProfileCard({ user, token, isNewUser, onUpdate, onLogout }: ProfileCardProps) {
  const [copiedToken, setCopiedToken] = useState(false);

  const updateProfileMutation = useUpdateProfile(token);
  const isLoading = updateProfileMutation.isPending;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
      age: user.age ?? undefined,
      profilePic: user.profilePic || "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(
      {
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        dob: values.dob || undefined,
        age: values.age ? Number(values.age) : undefined,
        profilePic: values.profilePic || undefined,
      },
      {
        onSuccess: (response) => {
          toast.success("Profile updated successfully!");
          onUpdate(response.data);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update profile");
        },
      }
    );
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    toast.success("JWT Token copied to clipboard!");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const userInitials = `${(user.firstName?.[0] || user.email?.[0] || user.phone?.[0] || "U").toUpperCase()}`;

  return (
    <Card className="w-full max-w-lg shadow-2xl border border-border/40 backdrop-blur-xl bg-card/80 transition-all duration-300 rounded-2xl sm:rounded-3xl p-2 sm:p-4">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 sm:size-14 border-2 border-primary/20 shadow-md">
              <AvatarImage src={user.profilePic || undefined} alt={user.firstName || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-base sm:text-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold">
                {user.firstName || user.lastName
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : "Authenticated User"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {user.email || user.phone || `User ID #${user.id}`}
              </CardDescription>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onLogout} title="Log Out" className="text-muted-foreground hover:text-destructive">
            <LogOut className="size-5" />
          </Button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {user.isEmailVerified && (
            <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
              <CheckCircle2 className="size-3" /> Email Verified
            </Badge>
          )}
          {user.isPhoneVerified && (
            <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs">
              <CheckCircle2 className="size-3" /> Phone Verified
            </Badge>
          )}
          {isNewUser && (
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs">
              ✨ New Account Created
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="dob"
                  type="date"
                  className="pl-9"
                  {...form.register("dob")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  className="pl-9"
                  {...form.register("age")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePic">Profile Picture URL</Label>
            <div className="relative">
              <Image className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                id="profilePic"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                className="pl-9"
                {...form.register("profilePic")}
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
            <Save className="size-4" />
            {isLoading ? "Saving Profile..." : "Save Profile Details"}
          </Button>
        </form>

        {/* JWT Token Information Box */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-primary" /> Active Session Token (JWT)
            </span>
            <Button variant="ghost" size="sm" onClick={copyToken} className="h-6 px-2 text-xs gap-1">
              {copiedToken ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copiedToken ? "Copied" : "Copy Token"}
            </Button>
          </div>
          <div className="p-2.5 bg-muted/50 rounded-lg text-[11px] font-mono text-muted-foreground break-all max-h-16 overflow-y-auto select-all border border-border/40">
            {token}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
