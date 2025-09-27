import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Waypoints",
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff'
          }} 
        />
        <Stack.Screen 
          name="map" 
          options={{ 
            title: "Map View",
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: '#fff'
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
