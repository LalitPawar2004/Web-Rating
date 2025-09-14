// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import the CSS file

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: ""
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "✅ Registered successfully!");
        setForm({ name: "", email: "", password: "", address: "" }); // reset form
        
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message || "❌ Registration failed");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join our rating community today</p>
        </div>
        
        {message && (
          <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Create a secure password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Enter your full address"
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        
        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="login-link"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;