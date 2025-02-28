import React, { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, resetAuthState } from "../../redux/authSlice";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, error, token, isFetching } = useSelector(
    (state) => state.auths
  );

  useEffect(() => {
    dispatch(resetAuthState());
    if (token && user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Đang đăng nhập với:", { email, password });

    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        console.log("Đăng nhập thành công:", resultAction.payload);
        navigate("/");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center">
        <img
          src={require("../../assets/images/egg.png")}
          alt="Logo"
          className="img-fluid"
        />
        <Form onSubmit={handleLogin} className="login-form">
          <h1 className="text-center mb-4">Login</h1>

          {error && <div className="alert alert-danger">{error}</div>}

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

          <Button
            variant="primary"
            type="submit"
            className="w-100 mt-3"
            disabled={isFetching}
          >
            {isFetching ? "Đang đăng nhập..." : "Login"}
          </Button>

          <div className="mt-2">
            Bạn chưa có tài khoản?{" "}
            <u
              onClick={() => navigate("/register")}
              style={{ cursor: "pointer" }}
            >
              Đăng ký ngay
            </u>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;
