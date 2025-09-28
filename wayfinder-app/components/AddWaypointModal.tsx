import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet 
} from 'react-native';
import { Waypoint, Coordinate, WaypointFormData } from '../types';

// props for the waypoint creation/editing modal
interface AddWaypointModalProps {
  visible: boolean;
  isEditing: boolean;
  editingWaypoint: Waypoint | null;
  pendingCoordinate: Coordinate | null;
  onAdd: (formData: WaypointFormData) => Promise<boolean>;
  onUpdate: (waypoint: Waypoint, formData: WaypointFormData) => Promise<boolean>;
  onCancel: () => void;
}

// modal popup for creating new waypoints or editing existing ones
export const AddWaypointModal: React.FC<AddWaypointModalProps> = ({
  visible,
  isEditing,
  editingWaypoint,
  pendingCoordinate,
  onAdd,
  onUpdate,
  onCancel
}) => {
  const [waypointName, setWaypointName] = useState('');
  const [waypointDescription, setWaypointDescription] = useState('');

  // pre-fills form with existing data when editing, clears when creating new
  useEffect(() => {
    if (visible && isEditing && editingWaypoint) {
      setWaypointName(editingWaypoint.name);
      setWaypointDescription(editingWaypoint.description || '');
    } else if (visible && !isEditing) {
      setWaypointName('');
      setWaypointDescription('');
    }
  }, [visible, isEditing, editingWaypoint]);

  // submits form data to either create new or update existing waypoint
  const handleSubmit = async () => {
    const formData: WaypointFormData = {
      name: waypointName,
      description: waypointDescription
    };

    let success = false;
    
    if (isEditing && editingWaypoint) {
      success = await onUpdate(editingWaypoint, formData);
    } else {
      success = await onAdd(formData);
    }

    if (success) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setWaypointName('');
    setWaypointDescription('');
    onCancel();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            🗺️ {isEditing ? 'Edit Waypoint' : 'Add Waypoint'}
          </Text>
          <Text style={styles.modalSubtitle}>
            {isEditing 
              ? 'Update your waypoint information' 
              : 'Create a new waypoint at this location'
            }
          </Text>
          
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
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.addButton, 
                !waypointName.trim() && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!waypointName.trim()}
            >
              <Text style={[
                styles.addButtonText, 
                !waypointName.trim() && styles.disabledButtonText
              ]}>
                {isEditing ? 'Update Waypoint' : 'Add Waypoint'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    gap: 15,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  addButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
    elevation: 0,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabledButtonText: {
    color: '#adb5bd',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});