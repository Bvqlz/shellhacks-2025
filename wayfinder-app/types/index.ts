import * as Location from 'expo-location';
import { Region } from 'react-native-maps';

export interface Waypoint {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface WaypointFormData {
  name: string;
  description: string;
}

export interface LocationState {
  userLocation: Location.LocationObject | null;
  region: Region | null;
  locationError: string | null;
  loading: boolean;
}

export interface WaypointState {
  waypoints: Waypoint[];
  loading: boolean;
  selectedWaypoint: Waypoint | null;
}