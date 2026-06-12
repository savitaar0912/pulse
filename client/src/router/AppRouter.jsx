import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/store";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";
import FeedPage from "../pages/feedPage";
import ProfilePage from '../pages/profilePage';
import EditProfileForm from "../features/profile/components/EditProfileForm";

function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/" replace />;
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />
      <Route path="/:username" element={<ProfilePage />} />
      <Route path="/settings" element={<EditProfileForm />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
