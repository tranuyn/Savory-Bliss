import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  // Giữ nguyên state.auths vì đó là tên đúng trong store
  const { token, isAuthReady } = useSelector(state => state.auths);
  console.log("Auth state in ProtectedRoute:", { token, isAuthReady });
  
  // Hiển thị loading hoặc trạng thái chờ khi chưa hoàn tất kiểm tra xác thực
  if (!isAuthReady) {
    return <div>Đang tải...</div>;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
