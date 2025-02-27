import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Register.css"; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Registering with:", formData);
      
      // const registerUser = async () => {
      //   try {
      //     const response = await fetch('/auth/register', {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify({
      //         username: formData.username,
      //         email: formData.email,
      //         password: formData.password,
      //         name: formData.name || formData.username
      //       }),
      //     });
      //     const data = await response.json();
      //     if (response.ok) {
      //       navigate('/login');
      //     } else {
      //       setErrors({ form: data.message });
      //     }
      //   } catch (error) {
      //     setErrors({ form: 'Lỗi kết nối server' });
      //   }
      // };
      // registerUser();
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