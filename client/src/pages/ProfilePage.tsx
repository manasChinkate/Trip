import { ProfileCard } from "@/features/profile/components/ProfileCard";
import { useAuth } from "@/features/auth/context/AuthContext";

export function ProfilePage() {
  const { user, token, isNewUser, logout } = useAuth();

  if (!user || !token) return null;

  return (
    <ProfileCard
      user={user}
      token={token}
      isNewUser={isNewUser}
      onUpdate={() => {}}
      onLogout={logout}
    />
  );
}
