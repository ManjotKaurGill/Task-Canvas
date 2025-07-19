import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export const signUpWithUserDetails = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await sendEmailVerification(user, {
    url: 'http://localhost:3000/',
  });

  return user;
};

export const saveUserToFirestore = async (uid, email, userData) => {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    ...userData,
    createdAt: new Date().toISOString(),
  });
};

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};
