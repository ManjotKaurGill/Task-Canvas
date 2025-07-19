import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { login, signInWithGoogle } from '../firebase/authService';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getDocs,
  query,
  collection,
  where,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate('/canvas');
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/canvas');
    } catch (err) {
      console.error('Google Sign-In error:', err);
      alert('Something went wrong during Google sign-in.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate('/canvas');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Sign In to Save Your Tasks</h2>
        <section>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="login-links">
            <Link to="/resetPassword">Forgot password?</Link>
            <p>Don't have an account? <Link to="/signup">Create your account</Link></p>
          </div>

          <button onClick={handleLogin} disabled={!email || !password}>Login</button>
          <button onClick={handleGoogleSignIn} className="google-btn">
            Sign in with Google
          </button>
        </section>
      </div>
    </div>
  );
}
