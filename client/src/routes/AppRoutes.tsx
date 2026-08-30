import { Routes, Route, Navigate } from "react-router-dom"
import { PlansPage } from "@/pages/PlansPage"
import { LoginPage } from "@/pages/LoginPage"
import { ProfilePage } from "@/pages/ProfilePage"
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/routes/ProtectedRoute"
import PlanDetailPage from "@/features/planDetail/pages/PlanDetailPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlansPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route
        path="/plans/:planId/itinerary"
        element={
          <ProtectedRoute>
            <PlanDetailPage />
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
  )
}
