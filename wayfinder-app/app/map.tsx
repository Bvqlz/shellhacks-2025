import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { useWaypoints } from '../hooks/useWaypoints';
import { MapMarkers } from '../components/MapMarkers';
import { AddWaypointModal } from '../components/AddWaypointModal';
import WaypointPopup from '../components/WaypointPopup';
import { mapStyles } from '../styles/mapStyles';
import { Waypoint, Coordinate, WaypointFormData } from '../types';

export default function MapScreen() {
  const { user, logout, loading: authLoading } = useAuth();
  const { userLocation, region, locationError, loading: locationLoading } = useLocation();
  const {
    waypoints,
    selectedWaypoint,
    setSelectedWaypoint,
    addWaypoint,
    updateWaypoint,
    deleteWaypointWithConfirmation,
    getPinColor
  } = useWaypoints({ userId: user?.uid });

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCoordinate, setPendingCoordinate] = useState<Coordinate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null);
  const [waypointPopupVisible, setWaypointPopupVisible] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      router.replace('./');
      return;
    }
  }, [user, authLoading]);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setPendingCoordinate(coordinate);
    setIsEditing(false);
    setEditingWaypoint(null);
    setModalVisible(true);
  };

  const handleAddWaypoint = async (formData: WaypointFormData): Promise<boolean> => {
    if (!pendingCoordinate || !user) return false;
    
    return await addWaypoint(pendingCoordinate, formData, user.email || 'Anonymous User');
  };

  const handleUpdateWaypoint = async (waypoint: Waypoint, formData: WaypointFormData): Promise<boolean> => {
    return await updateWaypoint(waypoint, formData);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setPendingCoordinate(null);
    setIsEditing(false);
    setEditingWaypoint(null);
  };

  const handleMarkerPress = (waypoint: Waypoint) => {
    setSelectedWaypoint(waypoint);
    setWaypointPopupVisible(true);
  };

  const handleWaypointPopupClose = () => {
    setWaypointPopupVisible(false);
    setSelectedWaypoint(null);
  };

  const handleWaypointPopupUpdate = async (waypoint: Waypoint, updates: { name: string; description: string }) => {
    const success = await updateWaypoint(waypoint, updates);
    if (success) {
      setWaypointPopupVisible(false);
      setSelectedWaypoint(null);
    }
  };

  const handleWaypointPopupDelete = async (waypoint: Waypoint) => {
    setWaypointPopupVisible(false);
    setSelectedWaypoint(null);
    deleteWaypointWithConfirmation(waypoint);
  };

  if (locationLoading || !region) {
    return (
      <View style={mapStyles.loadingContainer}>
        <Text style={mapStyles.loadingText}>Loading map...</Text>
        {locationError && (
          <Text style={mapStyles.errorText}>{locationError}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={mapStyles.container}>
      <MapView
        style={mapStyles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}
      >
        <MapMarkers
          userLocation={userLocation}
          waypoints={waypoints}
          getPinColor={getPinColor}
          onMarkerPress={handleMarkerPress}
        />
      </MapView>
      
      <TouchableOpacity style={mapStyles.logoutButton} onPress={logout}>
        <Text style={mapStyles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <AddWaypointModal
        visible={modalVisible}
        isEditing={isEditing}
        editingWaypoint={editingWaypoint}
        pendingCoordinate={pendingCoordinate}
        onAdd={handleAddWaypoint}
        onUpdate={handleUpdateWaypoint}
        onCancel={handleModalCancel}
      />

      <WaypointPopup
        waypoint={selectedWaypoint}
        visible={waypointPopupVisible}
        currentUserId={user?.uid || ''}
        onClose={handleWaypointPopupClose}
        onUpdate={handleWaypointPopupUpdate}
        onDelete={handleWaypointPopupDelete}
      />
    </View>
  );
}


