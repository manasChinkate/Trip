import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Edit3, Trash2, Copy, Check, Plus, LogIn, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Plan, type User } from "@/lib/api";
import { useDeletePlan } from "../hooks/usePlans";

interface PlanListProps {
  plans: Plan[];
  currentUser: User | null;
  token: string | null;
  onCreateClick: () => void;
  onJoinClick: () => void;
  onEditClick: (plan: Plan) => void;
  onViewMembersClick: (plan: Plan) => void;
  onJoinDirectly?: (planCode: string) => void;
}

export function PlanList({
  plans,
  currentUser,
  token,
  onCreateClick,
  onJoinClick,
  onEditClick,
  onViewMembersClick,
  onJoinDirectly,
}: PlanListProps) {
  const navigate = useNavigate();
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"ALL" | "MY">("ALL");

  const deletePlanMutation = useDeletePlan(token);

  const copyCode = (planId: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(planId);
    toast.success(`Plan Code ${code} copied!`);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleDelete = (plan: Plan) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) return;

    deletePlanMutation.mutate(plan.id, {
      onSuccess: () => {
        toast.success("Trip plan deleted successfully!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete trip plan");
      },
    });
  };

  const filteredPlans = plans.filter((plan) => {
    if (filter === "MY") {
      return currentUser && plan.planMembers?.some((m) => m.userId === currentUser.id);
    }
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-5xl mx-auto px-2 sm:px-4 pb-16 md:pb-6">
      {/* Header & Filter Controls - Mobile First Stack */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="size-5 sm:size-6 text-primary shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Browse Trip Plans</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore trip plans created by all users across the community.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {currentUser && (
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/40 text-xs w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all text-center ${
                  filter === "ALL"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Plans ({plans.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("MY")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium transition-all text-center ${
                  filter === "MY"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Trips
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onJoinClick}
              className="flex-1 sm:flex-initial text-xs gap-1.5 rounded-xl border-border/60 hover:bg-muted font-medium h-9"
            >
              <LogIn className="size-3.5 text-primary" /> Join with Code
            </Button>

            <Button
              size="sm"
              onClick={onCreateClick}
              className="flex-1 sm:flex-initial text-xs gap-1.5 rounded-xl font-semibold shadow-md shadow-primary/20 h-9"
            >
              <Plus className="size-3.5" /> Create Trip Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Grid */}
      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/20 space-y-3">
          <Sparkles className="size-10 text-muted-foreground/60" />
          <h3 className="text-lg font-bold">No Trip Plans Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {filter === "MY"
              ? "You haven't created or joined any trip plans yet."
              : "No trip plans available right now. Be the first to create one!"}
          </p>
          <Button size="sm" onClick={onCreateClick} className="rounded-xl gap-1.5 font-semibold">
            <Plus className="size-4" /> Create Trip Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPlans.map((plan) => {
            const members = plan.planMembers || [];
            const isCreator = currentUser?.id === plan.createdBy;
            const isMember = currentUser && members.some((m) => m.userId === currentUser.id);

            return (
              <Card
                key={plan.id}
                className="flex flex-col justify-between border border-border/40 backdrop-blur-xl bg-card/80 hover:shadow-xl hover:border-primary/40 transition-all duration-300 group rounded-2xl sm:rounded-3xl"
              >
                <CardHeader className="space-y-2.5 p-4 sm:p-6 pb-2 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      {plan.name || "Untitled Trip"}
                    </CardTitle>

                    {plan.planCode && (
                      <Badge
                        variant="outline"
                        onClick={() => copyCode(plan.id, plan.planCode!)}
                        className="cursor-pointer gap-1.5 font-mono text-xs font-bold border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors shrink-0 py-1"
                        title="Click to copy join code"
                      >
                        {plan.planCode}
                        {copiedCodeId === plan.id ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3 text-muted-foreground" />
                        )}
                      </Badge>
                    )}
                  </div>

                  <CardDescription className="text-xs flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : "TBD"}
                      {" - "}
                      {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : "TBD"}
                    </span>

                    {isCreator ? (
                      <Badge variant="default" className="text-[10px] h-5 gap-1 bg-primary/15 text-primary border-primary/20">
                        <ShieldCheck className="size-3" /> Creator
                      </Badge>
                    ) : isMember ? (
                      <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Joined
                      </Badge>
                    ) : null}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 py-2 space-y-3">
                  <div
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/30 cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => onViewMembersClick(plan)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {members.slice(0, 4).map((member) => {
                          const mUser = member.user;
                          const initials = `${(mUser?.firstName?.[0] || mUser?.email?.[0] || "U").toUpperCase()}`;
                          return (
                            <Avatar key={member.id} className="size-7 border-2 border-background">
                              <AvatarImage src={mUser?.profilePic || undefined} />
                              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-[10px]">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                      {members.length > 4 && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          +{members.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Users className="size-3.5" />
                      <span>{members.length} {members.length === 1 ? "Member" : "Members"}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 sm:p-6 pt-3 border-t border-border/30 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/plans/${plan.id}/itinerary`)}
                    className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 shadow-sm bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Calendar className="size-3.5" /> Itinerary & Bookings
                  </Button>

                  <div className="flex items-center gap-1">
                    {!isMember && plan.planCode && onJoinDirectly && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onJoinDirectly(plan.planCode!)}
                        className="h-8 px-2.5 text-xs gap-1 font-semibold text-primary bg-primary/10 hover:bg-primary/20"
                      >
                        <LogIn className="size-3" /> Join
                      </Button>
                    )}

                    {isMember && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditClick(plan)}
                        className="size-8 text-muted-foreground hover:text-foreground"
                        title="Edit Plan"
                      >
                        <Edit3 className="size-3.5" />
                      </Button>
                    )}

                    {isCreator && token && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletePlanMutation.isPending}
                        onClick={() => handleDelete(plan)}
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Plan"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
