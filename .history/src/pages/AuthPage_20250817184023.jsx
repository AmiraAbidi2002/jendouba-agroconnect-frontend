import React, { useState } from "react";
import "./AuthPage.css"; // CSS separate for animation

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(false);

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="auth-container">
      <div className={`card ${isSignIn ? "sign-in-mode" : ""}`}>
        {/* Left panel */}
        <div className="left-panel">
          <h2 className="title">{isSignIn ? "Hello, Friend!" : "Welcome Back!"}</h2>
          <p className="subtitle">
            {isSignIn
              ? "Enter your personal details to use all features"
              : "To keep connected with us please login"}
          </p>
          <button className="toggle-btn" onClick={toggleMode}>
            {isSignIn ? "SIGN UP" : "SIGN IN"}
          </button>
        </div>

        {/* Form panel */}
        <div className="form-panel">
          {isSignIn ? (
            <form className="form">
              <h2 className="form-title">Sign In</h2>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
          ) : (
            <form className="form">
              <h2 className="form-title">Create Account</h2>
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button type="submit" className="submit-btn">Sign Up</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
