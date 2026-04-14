import { Routes, Route, Navigate } from 'react-router-dom';

// Pages (we'll build these next session)
// Placeholders so the router doesn't crash
const LoginPage = () => <div>Login</div>;
const RegisterPage = () => <div>Register</div>;
const FeedPage = () => <div>Feed</div>;
const ProfilePage = () => <div>Profile</div>;
const NotFoundPage = () => <div>404</div>;

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<FeedPage />} />
      <Route path="/:username" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}