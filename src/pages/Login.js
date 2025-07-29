import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { login, signInWithGoogle } from '../firebase/authService';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await login(email, password);
    const user = userCredential.user;
    
    await user.reload();
    
    if (!user.emailVerified) {
      toast.error('Please verify your email before logging in.');
      return;
    }

    navigate('/canvas');
  } catch (err) {
    toast.error('Login failed: ' + err.message);
  }
};

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/canvas');
    } catch (err) {
      toast.error('Google Sign-In error:', err);
    }
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        navigate('/canvas');
      }
    }
  });
  return () => unsubscribe();
}, [navigate]);

  return (
    <div className="login-wrapper">
      <ToastContainer position="top-center" />
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
