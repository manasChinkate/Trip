import { useState } from "react";
import { Users, Copy, Check, UserMinus, ShieldCheck, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type Plan, type PlanMember, type User } from "@/lib/api";
import { useRemoveMember } from "../hooks/usePlans";

interface PlanMembersModalProps {
  plan: Plan | null;
  open: boolean;
  token: string | null;
  currentUser: User;
  onOpenChange: (open: boolean) => void;
}

export function PlanMembersModal({
  plan,
  open,
  token,
  currentUser,
  onOpenChange,
}: PlanMembersModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const removeMemberMutation = useRemoveMember(token);

  if (!plan) return null;

  const copyPlanCode = () => {
    if (plan.planCode) {
      navigator.clipboard.writeText(plan.planCode);
      setCopiedCode(true);
      toast.success(`Plan code ${plan.planCode} copied!`);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRemove = (member: PlanMember) => {
    removeMemberMutation.mutate(
      { planId: plan.id, userId: member.userId },
      {
        onSuccess: () => {
          const isSelf = member.userId === currentUser.id;
          toast.success(isSelf ? "You left the trip plan" : "Member removed from trip plan");
          if (isSelf) {
            onOpenChange(false);
          }
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to remove member");
        },
      }
    );
  };

  const isCurrentAdmin = plan.planMembers?.some(
    (m) => m.userId === currentUser.id && m.role === "ADMIN"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-lg rounded-2xl sm:rounded-3xl border-border/40 backdrop-blur-xl bg-card/95 p-5 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="size-5" />
            </div>
            {plan.planCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyPlanCode}
                className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 font-mono"
              >
                <Sparkles className="size-3.5 text-primary" />
                <span className="font-bold tracking-wider">{plan.planCode}</span>
                {copiedCode ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </Button>
            )}
          </div>
          <DialogTitle className="text-xl font-bold">{plan.name || "Trip Plan Details"}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="size-3.5" />
            {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "No start date"}
            {" — "}
            {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : "No end date"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Plan Members ({plan.planMembers?.length || 0})
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {plan.planMembers?.map((member) => {
              const memberUser = member.user;
              const isSelf = member.userId === currentUser.id;
              const initials = `${(memberUser?.firstName?.[0] || memberUser?.email?.[0] || memberUser?.phone?.[0] || "U").toUpperCase()}`;
              const name = memberUser?.firstName || memberUser?.lastName
                ? `${memberUser?.firstName || ""} ${memberUser?.lastName || ""}`.trim()
                : memberUser?.email || memberUser?.phone || `User #${member.userId}`;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-border">
                      <AvatarImage src={memberUser?.profilePic || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{name}</span>
                        {isSelf && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            You
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {memberUser?.email || memberUser?.phone || `ID #${member.userId}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.role === "ADMIN" ? "default" : "secondary"}
                      className="text-xs gap-1"
                    >
                      {member.role === "ADMIN" && <ShieldCheck className="size-3" />}
                      {member.role || "MEMBER"}
                    </Badge>

                    {(isCurrentAdmin || isSelf) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={removeMemberMutation.isPending}
                        onClick={() => handleRemove(member)}
                        title={isSelf ? "Leave Plan" : "Remove Member"}
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
