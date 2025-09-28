import React from 'react';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Waypoint } from '../types';

interface MapMarkersProps {
  userLocation: Location.LocationObject | null;
  waypoints: Waypoint[];
  getPinColor: (waypoint: Waypoint) => string;
  onMarkerPress: (waypoint: Waypoint) => void;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  userLocation,
  waypoints,
  getPinColor,
  onMarkerPress
}) => {
  return (
    <>
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
          onPress={() => onMarkerPress(waypoint)}
        />
      ))}
    </>
  );
};