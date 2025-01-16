"use client"

// src/components/LoginPage.tsx
import React, { useState } from 'react';
import './LoginPage.css';


const LoginPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1>Sign in for faster checkout.</h1>
      <h2>Sign in to Muhammadiyah Minimart</h2>

      <div className="login-row">
        <input
          className="login-input"
          type="text"
          placeholder="Email"
        />
      <div className="password-row">
        <input
          className="login-input"
          placeholder="Password"
          type="password"
    />
    <button className="arrow-btn">→</button>
  </div>
      </div>

      <div className="remember-me">
        <input type="checkbox" id="remember" />
        <label htmlFor="remember">Remember me</label>
      </div>

      <p><a href="#forgot">Forgot password?</a></p>
      <p>Don’t have an Account? <a href="#create">Create yours now.</a></p>
      <p>Need some help? <a href="#chat">Chat now</a></p>
    </div>
  );
};

export default LoginPage;