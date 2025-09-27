import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Authentication service for easy user management
export const authService = {
  // Register new user
  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      throw new Error(error.message);
    }
  },

  // Login existing user
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw new Error(error.message);
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      throw new Error(error.message);
    }
  },

  // Listen to authentication state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Get current user ID (useful for database queries)
  getCurrentUserId() {
    return auth.currentUser?.uid || null;
  }
};