import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import "./ResetPassword.css"; // Bạn sẽ cần tạo file CSS này

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams(); // Lấy token từ URL parameter
  
  const API_URL = process.env.REACT_APP_SERVER_URL 
  ? `${process.env.REACT_APP_SERVER_URL}/auth` 
  : `http://localhost:${process.env.REACT_APP_SERVER_PORT || 5000}/auth`;
  useEffect(() => {
    // Kiểm tra tính hợp lệ của token khi component được mount
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/verify-reset-token/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setMessage({ 
            type: "danger", 
            text: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." 
          });
        }
      } catch (error) {
        setTokenValid(false);
        setMessage({ type: "danger", text: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = () => {
    if (password.length < 6) {
      setMessage({ type: "danger", text: "Mật khẩu phải có ít nhất 6 ký tự" });
      return false;
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: "danger", text: "Mật khẩu xác nhận không khớp" });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới." 
        });
        // Tự động chuyển về trang login sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage({ type: "danger", text: data.msg || "Không thể đặt lại mật khẩu" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị thông báo lỗi nếu token không hợp lệ
  if (tokenValid === false) {
    return (
      <Container className="mt-5">
        <div className="reset-password-container">
          <img
            src={require("../../assets/images/egg.png")}
            alt="Logo"
            className="logo-image mb-4"
          />
          <div className="reset-password-form">
            <h2 className="text-center mb-4">Đặt lại mật khẩu</h2>
            <Alert variant="danger">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              <div className="mt-3">
                <Button 
                  variant="primary" 
                  onClick={() => navigate("/forgot-password")}
                  className="me-2"
                >
                  Yêu cầu liên kết mới
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate("/login")}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      </Container>
    );
  }

  // Hiển thị spinner khi đang kiểm tra token
  if (tokenValid === null) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang xác thực liên kết...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="reset-password-container">
        <img
          src={require("../../assets/images/egg.png")}
          alt="Logo"
          className="logo-image mb-4"
        />
        <div className="reset-password-form">
          <h2 className="text-center mb-4">Đặt lại mật khẩu</h2>
          
          {message.text && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Form.Text className="text-muted">
                Mật khẩu phải có ít nhất 6 ký tự.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
            
            <div className="text-center mt-3">
              <span 
                className="text-primary cursor-pointer" 
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                Quay lại đăng nhập
              </span>
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default ResetPassword;