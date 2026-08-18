import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Edit3, Save, RefreshCw } from "lucide-react";
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
import { type Plan } from "@/lib/api";
import { updatePlanSchema, type UpdatePlanFormValues } from "../schema/planSchema";
import { useUpdatePlan } from "../hooks/usePlans";

interface EditPlanModalProps {
  plan: Plan | null;
  open: boolean;
  token: string;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanModal({ plan, open, token, onOpenChange }: EditPlanModalProps) {
  const updatePlanMutation = useUpdatePlan(token);
  const isLoading = updatePlanMutation.isPending;

  const form = useForm<UpdatePlanFormValues>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name || "",
        startDate: plan.startDate ? new Date(plan.startDate).toISOString().split("T")[0] : "",
        endDate: plan.endDate ? new Date(plan.endDate).toISOString().split("T")[0] : "",
      });
    }
  }, [plan, form]);

  const onSubmit = (values: UpdatePlanFormValues) => {
    if (!plan) return;

    updatePlanMutation.mutate(
      {
        id: plan.id,
        payload: {
          name: values.name || undefined,
          startDate: values.startDate || undefined,
          endDate: values.endDate || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Trip plan updated successfully!");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update trip plan");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl sm:rounded-3xl border-border/40 backdrop-blur-xl bg-card/95 p-5 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Edit3 className="size-5" />
          </div>
          <DialogTitle className="text-xl font-bold">Edit Trip Plan</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the title or dates for this trip plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Trip Plan Name</Label>
            <Input
              id="edit-name"
              placeholder="Trip Plan Name"
              {...form.register("name")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="edit-startDate"
                  type="date"
                  className="pl-9"
                  {...form.register("startDate")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="edit-endDate"
                  type="date"
                  className="pl-9"
                  {...form.register("endDate")}
                />
              </div>
            </div>
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
            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <>
                  <Save className="size-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
