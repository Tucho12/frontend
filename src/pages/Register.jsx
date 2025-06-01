// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (response.status === 200 || response.status === 201) {
        alert("Registration successful!");
        console.log("Navigating to login page");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="register-container">
      <header className="text-center py-3 text-white">
        <h1>House Rentals Management System</h1>
      </header>

      <div className="register-box shadow p-4 rounded">
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={userData.email}
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
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              className="form-select"
              id="role"
              name="role"
              value={userData.role}
              onChange={handleChange}
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Register
          </button>
        </form>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => navigate("/login")}
          >
            Login here
          </button>
        </p>
        <div>
          <button
            className="btn btn-outline-primary d-flex align-items-center justify-content-center p-2"
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

export default Register;
