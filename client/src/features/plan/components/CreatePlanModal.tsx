import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Compass, Plus, RefreshCw } from "lucide-react";
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
import { createPlanSchema, type CreatePlanFormValues } from "../schema/planSchema";
import { useCreatePlan } from "../hooks/usePlans";

interface CreatePlanModalProps {
  open: boolean;
  token: string;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanModal({ open, token, onOpenChange }: CreatePlanModalProps) {
  const createPlanMutation = useCreatePlan(token);
  const isLoading = createPlanMutation.isPending;

  const form = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (values: CreatePlanFormValues) => {
    createPlanMutation.mutate(
      {
        name: values.name,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Trip plan created!");
          form.reset();
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to create trip plan");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl sm:rounded-3xl border-border/40 backdrop-blur-xl bg-card/95 p-5 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Compass className="size-5" />
          </div>
          <DialogTitle className="text-xl font-bold">Create a New Trip Plan</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set up your trip details. A unique join code will be generated for your friends.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Plan Name</Label>
            <Input
              id="name"
              placeholder="e.g. Bali Summer Vacation 2026"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive font-medium">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-9"
                  {...form.register("startDate")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="endDate"
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
                  <Plus className="size-4" /> Create Trip Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
