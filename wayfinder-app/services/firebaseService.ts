import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types for our data
interface Waypoint {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
}

interface Favorite {
  id: string;
  userId: string;
  waypointId: string;
  createdAt: string;
}

// Simple service for managing waypoints/locations
export const waypointService = {
  // Add a new waypoint for a specific user
  async addWaypoint(userId: string, name: string, latitude: number, longitude: number, description?: string) {
    try {
      const docRef = await addDoc(collection(db, 'waypoints'), {
        userId, // Link waypoint to user
        name,
        latitude,
        longitude,
        description: description || '',
        createdAt: new Date().toISOString(),
      });
      console.log('Waypoint added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding waypoint: ', error);
      throw error;
    }
  },

  // Get waypoints for a specific user
  async getUserWaypoints(userId: string) {
    try {
      const querySnapshot = await getDocs(collection(db, 'waypoints'));
      const waypoints: Waypoint[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          waypoints.push({
            id: doc.id,
            ...data
          } as Waypoint);
        }
      });
      
      // Sort by creation date (newest first)
      waypoints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return waypoints;
    } catch (error) {
      console.error('Error getting waypoints: ', error);
      throw error;
    }
  },

  // Create waypoint from form data (easy for your teammate to use)
  async createWaypointFromForm(formData: {
    userId: string;
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
    category?: string;
    isPublic?: boolean;
  }) {
    try {
      // Validate required fields
      if (!formData.userId || !formData.name || !formData.latitude || !formData.longitude) {
        throw new Error('Missing required fields: userId, name, latitude, longitude');
      }

      const waypointData = {
        userId: formData.userId,
        name: formData.name.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        description: formData.description?.trim() || '',
        category: formData.category || 'general',
        isPublic: formData.isPublic || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'waypoints'), waypointData);
      
      return {
        success: true,
        waypointId: docRef.id,
        message: 'Waypoint created successfully!',
        data: { id: docRef.id, ...waypointData }
      };
    } catch (error: any) {
      console.error('Error creating waypoint:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create waypoint'
      };
    }
  },

  // Update an existing waypoint
  async updateWaypoint(waypointId: string, updates: {
    name?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    category?: string;
    isPublic?: boolean;
  }) {
    try {
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      // Only include fields that are provided
      if (updates.name) updateData.name = updates.name.trim();
      if (updates.latitude !== undefined) updateData.latitude = Number(updates.latitude);
      if (updates.longitude !== undefined) updateData.longitude = Number(updates.longitude);
      if (updates.description !== undefined) updateData.description = updates.description.trim();
      if (updates.category) updateData.category = updates.category;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

      await updateDoc(doc(db, 'waypoints', waypointId), updateData);
      
      return {
        success: true,
        message: 'Waypoint updated successfully!'
      };
    } catch (error: any) {
      console.error('Error updating waypoint:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update waypoint'
      };
    }
  },

  // Delete a waypoint
  async deleteWaypoint(waypointId: string, userId: string) {
    try {
      // First check if the waypoint belongs to the user
      const waypointDoc = await getDoc(doc(db, 'waypoints', waypointId));
      
      if (!waypointDoc.exists()) {
        return {
          success: false,
          message: 'Waypoint not found'
        };
      }

      const waypointData = waypointDoc.data();
      if (waypointData.userId !== userId) {
        return {
          success: false,
          message: 'You can only delete your own waypoints'
        };
      }

      await deleteDoc(doc(db, 'waypoints', waypointId));
      
      return {
        success: true,
        message: 'Waypoint deleted successfully!'
      };
    } catch (error: any) {
      console.error('Error deleting waypoint:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete waypoint'
      };
    }
  },
};

// Simple service for user favorites
export const favoriteService = {
  // Add a favorite location
  async addFavorite(userId: string, waypointId: string) {
    try {
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        waypointId,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding favorite: ', error);
      throw error;
    }
  },

  // Get user's favorites
  async getUserFavorites(userId: string) {
    try {
      const querySnapshot = await getDocs(collection(db, 'favorites'));
      const favorites: Favorite[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          favorites.push({
            id: doc.id,
            ...data
          } as Favorite);
        }
      });
      
      return favorites;
    } catch (error) {
      console.error('Error getting favorites: ', error);
      throw error;
    }
  },
};