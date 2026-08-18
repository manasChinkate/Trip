import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, LogIn, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinPlanSchema, type JoinPlanFormValues } from "../schema/planSchema";
import { useJoinPlan } from "../hooks/usePlans";

import { useEffect } from "react";

interface JoinPlanModalProps {
  open: boolean;
  token: string;
  onOpenChange: (open: boolean) => void;
  prefilledCode?: string;
}

export function JoinPlanModal({ open, token, onOpenChange, prefilledCode = "" }: JoinPlanModalProps) {
  const joinPlanMutation = useJoinPlan(token);
  const isLoading = joinPlanMutation.isPending;

  const form = useForm<JoinPlanFormValues>({
    resolver: zodResolver(joinPlanSchema),
    defaultValues: {
      planCode: prefilledCode,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ planCode: prefilledCode });
    }
  }, [open, prefilledCode, form]);

  const onSubmit = (values: JoinPlanFormValues) => {
    joinPlanMutation.mutate(
      { planCode: values.planCode },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Joined trip plan successfully!");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to join trip plan");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl sm:rounded-3xl border-border/40 backdrop-blur-xl bg-card/95 p-5 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="size-5" />
          </div>
          <DialogTitle className="text-xl font-bold">Join a Trip Plan</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter the unique 8-character trip plan code shared by your friend (e.g. TRIP8X9A).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="planCode">Unique Plan Code</Label>
            <Input
              id="planCode"
              placeholder="e.g. TRIP8X9A"
              className="uppercase tracking-widest font-mono text-center text-lg"
              {...form.register("planCode")}
            />
            {form.formState.errors.planCode && (
              <p className="text-xs text-destructive font-medium">
                {form.formState.errors.planCode.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="size-4" /> Join Trip Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
