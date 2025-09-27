import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvlKTkIzFvvEIfg6PLsbbvJR63cFrpe9c",
  authDomain: "wayfinder-b3caa.firebaseapp.com",
  projectId: "wayfinder-b3caa",
  storageBucket: "wayfinder-b3caa.firebasestorage.app",
  messagingSenderId: "134828446621",
  appId: "1:134828446621:web:08b93351a642becff31574",
  measurementId: "G-GWEWFQKZH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;