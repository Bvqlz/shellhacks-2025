import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authService } from '../services/authService';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await authService.login(email, password);
        Alert.alert('Success', 'Welcome back!');
      } else {
        await authService.register(email, password);
        Alert.alert('Success', 'Account created successfully!');
      }
      onAuthSuccess();
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Provide user-friendly error messages
      if (errorMessage.includes('auth/email-already-in-use')) {
        errorMessage = 'This email is already registered. Try logging in instead.';
      } else if (errorMessage.includes('auth/weak-password')) {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (errorMessage.includes('auth/invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email. Try creating an account.';
      } else if (errorMessage.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Join Wayfinder today'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.authButton, loading && styles.disabledButton]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.authButtonText}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchButtonText}>
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"
            }
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  authButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    padding: 10,
  },
  switchButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
});