import { Text, View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { router } from 'expo-router';
import { useAuth } from "../contexts/AuthContext";
import AuthScreen from "../components/AuthScreen";

export default function Index() {
  const { user, loading } = useAuth();

  // Redirect to map when user logs in
  useEffect(() => {
    if (user) {
      router.replace('./map');
    }
  }, [user]); // Re-run when user changes

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // This component now just handles redirecting to map after login
  // The actual app content is in the map screen
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10 }}>Redirecting to map...</Text>
    </View>
  );
}
