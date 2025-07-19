import { useState } from 'react';
import {
  signUpWithUserDetails,
  saveUserToFirestore,
} from '../firebase/authService';
import { auth } from '../firebase/firebaseConfig';
import '../styles/signup.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState({ month: '', day: '', year: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const user = await signUpWithUserDetails(email, password);
      setFirebaseUser(user);
      setVerificationSent(true);
      alert('Verification email sent. Please check your inbox.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const checkIfVerified = async () => {
    if (!firebaseUser) return;
    setCheckingVerification(true);

    await firebaseUser.reload();
    const updatedUser = auth.currentUser;

    if (updatedUser.emailVerified) {
      await saveUserToFirestore(updatedUser.uid, email, {
        firstName,
        lastName,
        birthday,
      });

      navigate('/canvas');
    } else {
      alert('Email not verified yet. Please check again.');
    }

    setCheckingVerification(false);
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-container" onSubmit={handleSignup}>
        <h1>Create your Account</h1>
        <p>One account is all you need to access your personal canvas.</p>

        <div className="name-fields">
          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="birthday-fields">
          <select
            value={birthday.month}
            required
            onChange={(e) => setBirthday({ ...birthday, month: e.target.value })}
          >
            <option>Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>

          <select
            required
            value={birthday.day}
            onChange={(e) => setBirthday({ ...birthday, day: e.target.value })}
          >
            <option>Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>

          <select
            required
            value={birthday.year}
            onChange={(e) => setBirthday({ ...birthday, year: e.target.value })}
          >
            <option>Year</option>
            {Array.from({ length: 100 }, (_, i) => (
              <option key={i}>{new Date().getFullYear() - i}</option>
            ))}
          </select>
        </div>

        <div style={{ width: '95%' }}>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

        {!verificationSent && <button type="submit">Verify Email</button>}

        {verificationSent && (
          <div>
            <button type="button" onClick={checkIfVerified} disabled={checkingVerification}>
              {checkingVerification ? 'Checking...' : 'Sign up'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
