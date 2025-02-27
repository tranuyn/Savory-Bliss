import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
  };

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center">
        <img
          src={require("../../assets/images/egg.png")}
          alt="Logo"
          className="img-fluid"
        />
        <Form
          onSubmit={handleLogin}
          className="login-form "
        >
          <h1 className="text-center mb-4">Login</h1>
          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Login
          </Button>
          <div className="mt-2">Bạn chưa có tài khoản? <u onClick={()=>navigate("/register")} style={{cursor: 'pointer'}}>Đăng ký ngay</u></div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;
