'use client';
import { useState } from 'react';
import { resetPassword } from '../firebase/authService';
import '../styles/login.css'; 

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className='login-wrapper'>
      <div className='login-container'>
        <h2>Reset Your Password</h2>
        <input
          type='email'
          placeholder='Enter your registered email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button onClick={handleReset} disabled={!email}>Send Reset Link</button>
        {message && <p>{message}</p>}
        <p><a href="/login">Back to Login</a></p>
      </div>
    </div>
  );
}
