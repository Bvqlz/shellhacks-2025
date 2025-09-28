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

// data structures for waypoints and favorites stored in firebase
interface Waypoint {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
  createdBy: string;
}

interface Favorite {
  id: string;
  userId: string;
  waypointId: string;
  createdAt: string;
}

// main service for handling all waypoint database operations
export const waypointService = {
  // creates a new waypoint in firebase with user info and coordinates
  async addWaypoint(userId: string, name: string, latitude: number, longitude: number, description?: string, createdBy?: string) {
    try {
      const docRef = await addDoc(collection(db, 'waypoints'), {
        userId, // Link waypoint to user
        name,
        latitude,
        longitude,
        description: description || '',
        createdBy: createdBy || 'Anonymous User',
        createdAt: new Date().toISOString(),
      });
      console.log('Waypoint added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding waypoint: ', error);
      throw error;
    }
  },

  // fetches only waypoints created by a specific user
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

  // gets all waypoints from database since they're all public
  async getAllVisibleWaypoints(userId: string) {
    try {
      const querySnapshot = await getDocs(collection(db, 'waypoints'));
      const waypoints: Waypoint[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // all waypoints are public so everyone can see them
        waypoints.push({
          id: doc.id,
          ...data
        } as Waypoint);
      });
      
      // sort by newest first
      waypoints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return waypoints;
    } catch (error) {
      console.error('Error getting visible waypoints: ', error);
      throw error;
    }
  },

  // alternative way to create waypoint using structured form data with validation
  async createWaypointFromForm(formData: {
    userId: string;
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
    category?: string;
    createdBy?: string;
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
        createdBy: formData.createdBy || 'Anonymous User',
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

  // modifies existing waypoint but only if user owns it
  async updateWaypoint(waypointId: string, userId: string, updates: {
    name?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    category?: string;
  }) {
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
          message: 'You can only update your own waypoints'
        };
      }

      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      // Only include fields that are provided
      if (updates.name) updateData.name = updates.name.trim();
      if (updates.latitude !== undefined) updateData.latitude = Number(updates.latitude);
      if (updates.longitude !== undefined) updateData.longitude = Number(updates.longitude);
      if (updates.description !== undefined) updateData.description = updates.description.trim();
      if (updates.category) updateData.category = updates.category;

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

  // removes waypoint from database but only if user owns it
  async deleteWaypoint(waypointId: string, userId: string) {
    try {
      // check ownership before allowing deletion
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

// handles user's favorite waypoints (currently not used in app)
export const favoriteService = {
  // saves a waypoint as favorite for a user
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

  // retrieves all favorites for a specific user
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