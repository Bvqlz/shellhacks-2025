import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, TextInput, Modal, Platform, Pressable } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { waypointService } from '../services/firebaseService';
import WaypointPopup from '../components/WaypointPopup';

interface Waypoint {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
  createdBy: string;
  attendees: string[]; // Array of user IDs who are attending
}

export default function MapScreen() {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [waypointName, setWaypointName] = useState('');
  const [waypointDescription, setWaypointDescription] = useState('');
  const [pendingCoordinate, setPendingCoordinate] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [waypointPopupVisible, setWaypointPopupVisible] = useState(false);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLocationError(null);

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission is required to use the map. Please enable location access in your device settings.');
          // Set default region to a central location if permission denied
          setRegion({
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
        
        // Set initial map region to user's location
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Unable to get your location. Using default location.');
        // Set default region if location fails
        setRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load waypoints
  useEffect(() => {
    if (user) {
      loadWaypoints();
    }
  }, [user]);

  const loadWaypoints = async () => {
    if (!user) return;
    try {
      const data = await waypointService.getAllVisibleWaypoints(user.uid);
      console.log(`Loaded ${data.length} waypoints:`);
      data.forEach(waypoint => {
        const isOwn = waypoint.userId === user.uid;
        console.log(`- ${waypoint.name} (${isOwn ? 'Own' : 'Others'}) - Creator: ${waypoint.createdBy}`);
      });
      setWaypoints(data);
    } catch (error) {
      console.error('Error loading waypoints:', error);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setPendingCoordinate(coordinate);
    setModalVisible(true);
  };

  const handleAddWaypoint = async () => {
    if (waypointName.trim() && pendingCoordinate && user) {
      try {
        if (isEditing && editingWaypoint) {
          // Update existing waypoint
          const result = await waypointService.updateWaypoint(editingWaypoint.id, user.uid, {
            name: waypointName.trim(),
            description: waypointDescription.trim()
          });
          
          if (result.success) {
            loadWaypoints(); // Refresh waypoints
            Alert.alert('Success', 'Waypoint updated successfully!');
          } else {
            Alert.alert('Error', result.message || 'Failed to update waypoint');
          }
        } else {
          // Create new waypoint (all waypoints are public)
          await waypointService.addWaypoint(
            user.uid,
            waypointName.trim(),
            pendingCoordinate.latitude,
            pendingCoordinate.longitude,
            waypointDescription.trim(),
            user.email || 'Anonymous User'
          );
          loadWaypoints(); // Refresh waypoints
          Alert.alert('Success', 'Waypoint added successfully!');
        }
        
        setModalVisible(false);
        setWaypointName('');
        setWaypointDescription('');
        setPendingCoordinate(null);
        setIsEditing(false);
        setEditingWaypoint(null);
      } catch (error) {
        console.error('Error with waypoint:', error);
        Alert.alert('Error', isEditing ? 'Failed to update waypoint' : 'Failed to add waypoint');
      }
    }
  };

  const handleCancelWaypoint = () => {
    setModalVisible(false);
    setWaypointName('');
    setWaypointDescription('');
    setPendingCoordinate(null);
    setIsEditing(false);
    setEditingWaypoint(null);
  };

  const getPinColor = (waypoint: Waypoint) => {
    if (!user) return "red";
    
    // User's own waypoints are blue, others' waypoints are red
    if (waypoint.userId === user.uid) {
      return "blue";  // User's own waypoints
    } else {
      return "red";   // Other users' public waypoints
    }
  };

  const handleMarkerLongPress = (waypoint: Waypoint) => {
    // Open edit mode
    setIsEditing(true);
    setEditingWaypoint(waypoint);
    setWaypointName(waypoint.name);
    setWaypointDescription(waypoint.description || '');
    setPendingCoordinate({
      latitude: waypoint.latitude,
      longitude: waypoint.longitude
    });
    setModalVisible(true);
  };

  const handleDeleteWaypoint = async (waypoint: Waypoint) => {
    if (!user) return;

    try {
      const result = await waypointService.deleteWaypoint(waypoint.id, user.uid);
      
      if (result.success) {
        loadWaypoints(); // Refresh waypoints
        Alert.alert('Success', 'Waypoint deleted successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to delete waypoint');
      }
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      Alert.alert('Error', 'Failed to delete waypoint');
    }
  };

  // Handlers for the waypoint popup
  const handleMarkerPress = (waypoint: Waypoint) => {
    setSelectedWaypoint(waypoint);
    setWaypointPopupVisible(true);
  };

  const handleWaypointPopupClose = () => {
    setWaypointPopupVisible(false);
    setSelectedWaypoint(null);
  };

  const handleWaypointUpdate = async (waypoint: Waypoint, updates: { name: string; description: string }) => {
    if (!user) return;

    try {
      const result = await waypointService.updateWaypoint(waypoint.id, user.uid, updates);
      
      if (result.success) {
        loadWaypoints(); // Refresh waypoints
        setWaypointPopupVisible(false);
        setSelectedWaypoint(null);
        Alert.alert('Success', 'Waypoint updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to update waypoint');
      }
    } catch (error) {
      console.error('Error updating waypoint:', error);
      Alert.alert('Error', 'Failed to update waypoint');
    }
  };

  const handleWaypointDelete = async (waypoint: Waypoint) => {
    setWaypointPopupVisible(false);
    setSelectedWaypoint(null);
    
    Alert.alert(
      'Delete Waypoint',
      `Are you sure you want to delete "${waypoint.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            
            try {
              const result = await waypointService.deleteWaypoint(waypoint.id, user.uid);
              
              if (result.success) {
                loadWaypoints(); // Refresh waypoints
                Alert.alert('Success', 'Waypoint deleted successfully!');
              } else {
                Alert.alert('Error', result.message || 'Failed to delete waypoint');
              }
            } catch (error) {
              console.error('Error deleting waypoint:', error);
              Alert.alert('Error', 'Failed to delete waypoint');
            }
          }
        }
      ]
    );
  };

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
        {locationError && (
          <Text style={styles.errorText}>{locationError}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {/* Waypoint markers */}
        {waypoints.map((waypoint) => (
          <Marker
            key={waypoint.id}
            coordinate={{
              latitude: waypoint.latitude,
              longitude: waypoint.longitude,
            }}
            title={waypoint.name}
            description={waypoint.description || `Created: ${new Date(waypoint.createdAt).toLocaleDateString()}`}
            pinColor={getPinColor(waypoint)}
            onPress={() => handleMarkerPress(waypoint)}
          />
        ))}
      </MapView>
      
      <TouchableOpacity style={styles.refreshButton} onPress={loadWaypoints}>
        <Text style={styles.refreshButtonText}>Refresh Waypoints</Text>
      </TouchableOpacity>

      {/* Add Waypoint Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelWaypoint}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🗺️ {isEditing ? 'Edit Waypoint' : 'Add Waypoint'}</Text>
            <Text style={styles.modalSubtitle}>{isEditing ? 'Update your waypoint information' : 'Create a new waypoint at this location'}</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Waypoint name (required)*"
              value={waypointName}
              onChangeText={setWaypointName}
              autoFocus={true}
              returnKeyType="next"
            />
            
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Description (optional)"
              value={waypointDescription}
              onChangeText={setWaypointDescription}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />
            
            {pendingCoordinate && (
              <View style={styles.coordinateInfo}>
                <Text style={styles.coordinateText}>
                  📍 Lat: {pendingCoordinate.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinateText}>
                  📍 Lng: {pendingCoordinate.longitude.toFixed(6)}
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelWaypoint}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.addButton, !waypointName.trim() && styles.disabledButton]}
                onPress={handleAddWaypoint}
                disabled={!waypointName.trim()}
              >
                <Text style={[styles.addButtonText, !waypointName.trim() && styles.disabledButtonText]}>
                  {isEditing ? 'Update Waypoint' : 'Add Waypoint'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Waypoint Popup */}
      <WaypointPopup
        waypoint={selectedWaypoint}
        visible={waypointPopupVisible}
        currentUserId={user?.uid || ''}
        onClose={handleWaypointPopupClose}
        onUpdate={handleWaypointUpdate}
        onDelete={handleWaypointDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 10,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  coordinateInfo: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  coordinateText: {
    fontSize: 12,
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
});
