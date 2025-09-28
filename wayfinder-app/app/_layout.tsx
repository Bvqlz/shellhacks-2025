import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Wayfinder",
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff'
          }} 
        />
        <Stack.Screen 
          name="map" 
          options={{ 
            title: "Wayfinder - Map",
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff'
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
