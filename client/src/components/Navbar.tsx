import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Plus, LogIn, Moon, Sun, Compass, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { type User } from "@/lib/api";

interface NavbarProps {
  user: User | null;
  onCreatePlanClick: () => void;
  onJoinPlanClick: () => void;
  onLogout: () => void;
}

export function Navbar({
  user,
  onCreatePlanClick,
  onJoinPlanClick,
  onLogout,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePage = location.pathname === "/profile";
  const isPlansPage = location.pathname === "/plans" || location.pathname === "/";

  const userInitials = `${(user?.firstName?.[0] || user?.email?.[0] || user?.phone?.[0] || "U").toUpperCase()}`;

  return (
    <>
      {/* Top Navbar */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/85 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link
            to={user ? "/plans" : "/login"}
            className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight select-none"
          >
            <div className="size-8 sm:size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
              <ShieldCheck className="size-4 sm:size-5" />
            </div>
            <span>Trip<span className="text-primary">Planner</span></span>
          </Link>

          {/* Top Actions (Desktop & Tablet) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant={isPlansPage ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => navigate("/plans")}
                    className="gap-2 text-xs font-medium"
                  >
                    <Compass className="size-4" />
                    <span>Browse Plans</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onJoinPlanClick}
                    className="gap-1.5 text-xs font-medium"
                  >
                    <LogIn className="size-3.5" />
                    <span>Join Plan</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={onCreatePlanClick}
                    className="gap-1.5 text-xs font-semibold shadow-sm"
                  >
                    <Plus className="size-3.5" />
                    <span>Create Plan</span>
                  </Button>
                </div>

                <div className="h-5 w-px bg-border/60 mx-1 hidden md:block" />

                {/* Profile Link (Desktop) */}
                <Button
                  variant={isProfilePage ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="hidden md:flex gap-2 px-2"
                  title="User Profile"
                >
                  <Avatar className="size-7 border border-primary/30">
                    <AvatarImage src={user.profilePic || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">
                    {user.firstName || "Account"}
                  </span>
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full size-8 sm:size-9"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle Theme"
                >
                  {theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
                </Button>

                {/* Log Out */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="size-8 sm:size-9 text-muted-foreground hover:text-destructive"
                  title="Log Out"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full size-8 sm:size-9 p-0"
                >
                  {theme === "dark" ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
                </Button>
                <Button size="sm" onClick={() => navigate("/login")} className="text-xs font-semibold">
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens < md) */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border/40 py-1.5 px-4 flex items-center justify-around shadow-2xl">
          <button
            type="button"
            onClick={() => navigate("/plans")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
              isPlansPage ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="size-5" />
            <span>Plans</span>
          </button>

          <button
            type="button"
            onClick={onJoinPlanClick}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogIn className="size-5" />
            <span>Join</span>
          </button>

          <button
            type="button"
            onClick={onCreatePlanClick}
            className="flex flex-col items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg -mt-5 border-4 border-background active:scale-95 transition-transform"
            title="Create Plan"
          >
            <Plus className="size-6" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-medium transition-colors ${
              isProfilePage ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Avatar className="size-5 border border-primary/30">
              <AvatarImage src={user.profilePic || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-[9px]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span>Profile</span>
          </button>
        </div>
      )}
    </>
  );
}
