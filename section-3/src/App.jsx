import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import EmployeePage from './pages/EmployeePage';
import './App.css';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* หน้า Login สำหรับผู้ใช้ทุกคน */}
          <Route path="/login" element={<LoginPage />} />

          {/* หน้า Admin: เข้าถึงได้เฉพาะ role admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* หน้า Employee: เข้าถึงได้เฉพาะ role employee */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeePage />
              </ProtectedRoute>
            }
          />

          {/* Route ตั้งต้น / และกรณีพิมพ์ URL อื่นที่ไม่ตรง ให้ส่งไปตามบทบาทหรือหน้า Login */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
