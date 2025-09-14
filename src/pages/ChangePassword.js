import React, { useState } from "react";
import "./ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("userEmail"); // logged-in user's email

  const validatePassword = (password) => {
    // 8-16 chars, at least one uppercase letter and one special character
    return /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setMessage(
        "❌ Password must be 8-16 characters, include at least one uppercase letter and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ New password and confirm password do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        // Clear inputs
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleChangePassword}>
        <div>
          <label>Old Password:</label>
          <br />
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>New Password:</label>
          <br />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <br />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn">
          Save
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
