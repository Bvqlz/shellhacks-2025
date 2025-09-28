import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { waypointService } from '../services/firebaseService';
import { Waypoint, Coordinate, WaypointFormData } from '../types';

interface UseWaypointsProps {
  userId?: string;
}

export const useWaypoints = ({ userId }: UseWaypointsProps) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWaypoints = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await waypointService.getAllVisibleWaypoints(userId);
      console.log(`Loaded ${data.length} waypoints:`);
      data.forEach(waypoint => {
        const isOwn = waypoint.userId === userId;
        console.log(`- ${waypoint.name} (${isOwn ? 'Own' : 'Others'}) - Creator: ${waypoint.createdBy}`);
      });
      setWaypoints(data);
    } catch (error) {
      console.error('Error loading waypoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWaypoint = async (
    coordinate: Coordinate,
    formData: WaypointFormData,
    userEmail: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      await waypointService.addWaypoint(
        userId,
        formData.name.trim(),
        coordinate.latitude,
        coordinate.longitude,
        formData.description.trim(),
        userEmail
      );
      await loadWaypoints();
      Alert.alert('Success', 'Waypoint added successfully!');
      return true;
    } catch (error) {
      console.error('Error adding waypoint:', error);
      Alert.alert('Error', 'Failed to add waypoint');
      return false;
    }
  };

  const updateWaypoint = async (
    waypoint: Waypoint,
    updates: WaypointFormData
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const result = await waypointService.updateWaypoint(waypoint.id, userId, {
        name: updates.name.trim(),
        description: updates.description.trim()
      });
      
      if (result.success) {
        await loadWaypoints();
        Alert.alert('Success', 'Waypoint updated successfully!');
        return true;
      } else {
        Alert.alert('Error', result.message || 'Failed to update waypoint');
        return false;
      }
    } catch (error) {
      console.error('Error updating waypoint:', error);
      Alert.alert('Error', 'Failed to update waypoint');
      return false;
    }
  };

  const deleteWaypoint = async (waypoint: Waypoint): Promise<boolean> => {
    if (!userId) return false;

    try {
      const result = await waypointService.deleteWaypoint(waypoint.id, userId);
      
      if (result.success) {
        await loadWaypoints();
        Alert.alert('Success', 'Waypoint deleted successfully!');
        return true;
      } else {
        Alert.alert('Error', result.message || 'Failed to delete waypoint');
        return false;
      }
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      Alert.alert('Error', 'Failed to delete waypoint');
      return false;
    }
  };

  const deleteWaypointWithConfirmation = (waypoint: Waypoint) => {
    Alert.alert(
      'Delete Waypoint',
      `Are you sure you want to delete "${waypoint.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWaypoint(waypoint)
        }
      ]
    );
  };

  const getPinColor = (waypoint: Waypoint) => {
    if (!userId) return "red";
    
    // User's own waypoints are blue, others' waypoints are red
    return waypoint.userId === userId ? "blue" : "red";
  };

  // Load waypoints when userId changes
  useEffect(() => {
    if (userId) {
      loadWaypoints();
    }
  }, [userId]);

  return {
    waypoints,
    selectedWaypoint,
    loading,
    setSelectedWaypoint,
    loadWaypoints,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    deleteWaypointWithConfirmation,
    getPinColor
  };
};