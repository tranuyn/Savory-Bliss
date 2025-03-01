import React, { useEffect, useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { registerUser } from "../../redux/authSlice";
import { useDispatch, useSelector } from "react-redux";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, isFetching, registrationSuccess } = useSelector(
    (state) => state.auths
  );

  useEffect(() => {
    // Nếu đăng ký thành công, chuyển đến trang đăng nhập
    if (registrationSuccess) {
      navigate("/login");
    }
  }, [registrationSuccess, navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra username
    if (formData.username.length < 5) {
      newErrors.username = "Username phải có ít nhất 5 ký tự";
    }

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Kiểm tra password
    if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.username,
        };

        await dispatch(registerUser(userData));
      } catch (err) {
        console.error("Lỗi đăng ký:", err);
      }
    }
  };

  return (
    <Container className="mt-2">
      <div className="d-flex align-items-center">
        <img
          src={require("../../assets/images/egg.png")}
          alt="Logo"
          className="img-fluid mb-3"
        />
        <Form onSubmit={handleSubmit} className="register-form">
          <h1 className="text-center">Đăng ký</h1>

          {errors.form && (
            <div className="alert alert-danger">{errors.form}</div>
          )}

          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Nhập username"
              value={formData.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formName">
            <Form.Label>Họ tên (không bắt buộc)</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Nhập họ tên"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formConfirmPassword">
            <Form.Label>Xác nhận mật khẩu</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Đăng ký
          </Button>

          <div className="mt-2">
            Đã có tài khoản?{" "}
            <u onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
              Đăng nhập
            </u>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Register;
