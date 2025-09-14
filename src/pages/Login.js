// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.message || "Login failed");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setMessage("Login successful!");

      // Save logged-in email
      localStorage.setItem("userEmail", data.user.email);

      // If store-owner, save separately
      if (data.user.role === "store-owner") {
        localStorage.setItem("storeOwnerEmail", data.user.email);
        navigate("/store-owner");
      } else if (data.user.role === "admin") {
        localStorage.setItem("userEmail", data.user.email);
        navigate("/admin");
      } else if (data.user.role === "user") {
        localStorage.setItem("userEmail", data.user.email);
        navigate("/stores");
      }
    } catch (error) {
      setMessage("Server connection error");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your rating dashboard</p>
        </div>
        
        {message && (
          <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="register-link"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;