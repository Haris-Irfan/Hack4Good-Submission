"use client"

// src/components/LoginPage.tsx
import React, { useState } from 'react';
import './LoginPage.css';
import { auth, createUserData, getUserData, newUserSignUp, updateUserData } from '@/firebaseConfig';
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

interface Transaction {
  item_name: string;
  quantity: number;
  purchase_date: Timestamp;
}

type transactions = Transaction[];

let voucher_amount = 0;
let transaction_history : transactions[] = []

const LoginPage: React.FC = () => {
  const [popup, setPopup] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccessAlert, setSignUpSuccessAlert] = useState<boolean>(false)

  const loadUserData = async () => {
    if (!auth.currentUser) {
      console.error("No user signed in");
      return;
    }
    const data = await getUserData()
    if (data) {
      voucher_amount = data["voucher_amount"]
      transaction_history = data["transaction_history"]
    }
  }

  const storeToFirestore = async () => {
    updateUserData(voucher_amount, transaction_history)
  }

  const handleSignUp = async () => {
    try {
      const response = await newUserSignUp(email, password)
      if (response) {
        await createUserData(0, [])
        setSignUpSuccessAlert(true)
      }
    } catch(error) {
      console.error(error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password) 
      await loadUserData()
      await storeToFirestore()
      setPopup(null);
      await storeToFirestore()
      console.log("Successful login")
    } catch (err: any) {
      console.error(err.message);
      setError('Invalid email or password. Please try again.')
    }
  };

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