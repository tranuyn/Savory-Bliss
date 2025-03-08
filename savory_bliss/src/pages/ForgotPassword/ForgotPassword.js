import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../redux/authSlice";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isFetching, error } = useSelector((state) => state.auths);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    // Validate email
    if (!validateEmail(email)) {
      setMessage({
        type: "danger",
        text: "Vui lòng nhập đúng định dạng email",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(email));

      if (forgotPassword.fulfilled.match(resultAction)) {
        setMessage({
          type: "success",
          text: "Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hòm thư của bạn.",
        });
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else if (forgotPassword.rejected.match(resultAction)) {
        // Handle the specific error message from the backend
        setMessage({
          type: "danger",
          text:
            resultAction.payload ||
            "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
        });
      }
    } catch (error) {
      setMessage({
        type: "danger",
        text: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-1">
      <div className="forgot-password-container">
        <img
          src={require("../../assets/images/egg.png")}
          alt="Logo"
          className="logo-image mb-2"
        />
        <div className="forgot-password-form">
          <h2 className="text-center mb-4">Quên mật khẩu</h2>

          {message.text && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          <p className="text-muted mb-4">
            Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi cho bạn một email
            với hướng dẫn đặt lại mật khẩu.
          </p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
            </Button>

            <div className="d-flex justify-content-between mt-3">
              <span
                className="text-primary cursor-pointer"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                Quay lại đăng nhập
              </span>
              <span
                className="text-primary cursor-pointer"
                onClick={() => navigate("/register")}
                style={{ cursor: "pointer" }}
              >
                Đăng ký tài khoản mới
              </span>
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default ForgotPassword;
