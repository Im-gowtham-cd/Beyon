import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoginPage } from '../auth/pages/LoginPage';
import { RegisterPage } from '../auth/pages/RegisterPage';
import { VerifyEmailPage } from '../auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../auth/pages/ResetPasswordPage';
import { UnauthorizedPage } from '../auth/pages/UnauthorizedPage';
import { RoleSelectPage } from '../auth/pages/RoleSelectPage';
import { ProtectedRoute } from '../auth/guards/ProtectedRoute';
import { RoleGuard } from '../auth/guards/RoleGuard';
import { StudentHome } from '../pages/student/StudentHome';
import { InstitutionHome } from '../pages/institution/InstitutionHome';
import { CompanyHome } from '../pages/company/CompanyHome';
import { AdminHome } from '../pages/admin/AdminHome';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/select-role" element={<RoleSelectPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
          <Route path="/student/home" element={<StudentHome />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={['INSTITUTION']} />}>
          <Route path="/institution/home" element={<InstitutionHome />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={['COMPANY']} />}>
          <Route path="/company/home" element={<CompanyHome />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin/home" element={<AdminHome />} />
        </Route>
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
