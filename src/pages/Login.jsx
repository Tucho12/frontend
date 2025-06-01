import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { FaArrowLeft } from "react-icons/fa"; 

const Login = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        const decoded = jwt_decode(data.token);
        const userRole = decoded.role;

        if (!userRole) {
          alert("Invalid role detected. Please contact support.");
          navigate("/");
          return;
        }

        setUserRole(userRole); // Update App state
        navigate(`/${userRole}`);
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <header className="header text-center py-3">
        <h1>House Rentals Management System</h1>
      </header>

      <div className="login-box shadow p-4 float-end">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Login
          </button>
        </form>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => navigate("/register")}
          >
            Register here
          </button>
        </p>
        <div>
          <button
            className="btn btn-outline-success d-flex align-items-center justify-content-center p-2"
            onClick={() => navigate("/")}
            style={{
              position: "fixed",
              top: "15px",
              left: "20px",
              width: "40px",
              height: "30px",
            }}
          >
            <FaArrowLeft />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
