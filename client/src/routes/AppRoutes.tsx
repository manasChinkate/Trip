import { Routes, Route, Navigate } from "react-router-dom";
import { PlansPage } from "@/pages/PlansPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ItineraryPage } from "@/pages/ItineraryPage";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/routes/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlansPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route
        path="/plans/:planId/itinerary"
        element={
          <ProtectedRoute>
            <ItineraryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Routes */}
      <Route path="*" element={<Navigate to="/plans" replace />} />
    </Routes>
  );
}

