import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route Guard Component
 * 1. ตรวจสอบว่า Login แล้วหรือยัง? หากยังไม่ได้ Login ให้ redirect ไปที่ /login
 * 2. หาก Login แล้ว แต่เข้า URL ของอีก Role:
 *    - redirect ไปหน้าของตนเอง (/admin หรือ /employee)
 *    - แสดงข้อความแจ้งเตือนให้ผู้ใช้ทราบว่าไม่มีสิทธิ์เข้าถึงหน้านั้น
 */
export default function ProtectedRoute({ requiredRole, children }) {
  const { user, isAuthenticated, setRouteNotice } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== requiredRole) {
      const deniedPath = location.pathname;
      const targetRoleName = requiredRole === 'admin' ? 'Admin' : 'Employee';
      const userRoleName = user.role === 'admin' ? 'Admin' : 'Employee';

      setRouteNotice(
        `⛔ ปฏิเสธการเข้าถึง: คุณเข้าสู่ระบบด้วยสิทธิ์ "${userRoleName}" จึงไม่สามารถเข้าถึงหน้า "${deniedPath}" (สงวนสิทธิ์สำหรับ ${targetRoleName} เท่านั้น) ระบบได้นำคุณกลับมายังหน้าของคุณโดยอัตโนมัติ`
      );
    }
  }, [isAuthenticated, user, requiredRole, location.pathname, setRouteNotice]);

  // กรณีที่ 1: ยังไม่ได้ Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // กรณีที่ 2: พยายามเข้า URL ของอีก Role
  if (user.role !== requiredRole) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/employee';
    return <Navigate to={redirectPath} replace />;
  }

  // กรณีที่ 3: สิทธิ์ถูกต้อง
  return children;
}
