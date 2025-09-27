import { Text, View, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { router } from 'expo-router';
import { waypointService } from "../services/firebaseService";
import { useAuth } from "../contexts/AuthContext";
import AuthScreen from "../components/AuthScreen";

interface Waypoint {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
}

export default function Index() {
  const { user, loading, logout } = useAuth();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // Load waypoints when user changes (including when they first log in)
  useEffect(() => {
    if (user) {
      loadWaypoints();
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

  const loadWaypoints = async () => {
    if (!user) return;
    try {
      const data = await waypointService.getUserWaypoints(user.uid);
      setWaypoints(data);
    } catch (error) {
      console.error("Error loading waypoints:", error);
    }
  };

  const addSampleWaypoint = async () => {
    if (!user) return;
    
    const result = await waypointService.createWaypointFromForm({
      userId: user.uid,
      name: "Sample Location",
      latitude: 25.7617, // Miami latitude
      longitude: -80.1918, // Miami longitude
      description: "This is a sample waypoint for " + user.email,
      category: "sample",
      isPublic: false
    });

    if (result.success) {
      Alert.alert("Success", result.message);
      loadWaypoints(); // Refresh the list
    } else {
      Alert.alert("Error", result.message);
    }
  };

  // Main app content for authenticated users
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* User info and logout */}
      <View style={{ position: 'absolute', top: 50, right: 20 }}>
        <Text style={{ fontSize: 14, color: 'gray', marginBottom: 5 }}>
          Welcome, {user.email}
        </Text>
        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: "#ff4444",
            padding: 8,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 24, marginBottom: 20 }}>Wayfinder App</Text>
      <Text style={{ marginBottom: 10 }}>Your Waypoints: {waypoints.length}</Text>
      
      <TouchableOpacity
        onPress={addSampleWaypoint}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Add Sample Waypoint
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.mapButton}
        onPress={() => router.push('./map')}
      >
        <Text style={styles.mapButtonText}>🗺️ View Map</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, color: "gray", textAlign: "center" }}>
        Your personal waypoints are saved to your account!
        {"\n"}User ID: {user.uid.substring(0, 8)}...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  mapButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
