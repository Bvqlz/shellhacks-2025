import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';

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

interface WaypointPopupProps {
  waypoint: Waypoint | null;
  visible: boolean;
  currentUserId: string;
  onClose: () => void;
  onUpdate: (waypoint: Waypoint, updates: { name: string; description: string }) => void;
  onDelete: (waypoint: Waypoint) => void;
}

export default function WaypointPopup({
  waypoint,
  visible,
  currentUserId,
  onClose,
  onUpdate,
  onDelete,
}: WaypointPopupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  if (!waypoint) return null;

  const isOwner = waypoint.userId === currentUserId;

  const handleEditStart = () => {
    setEditName(waypoint.name);
    setEditDescription(waypoint.description);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName('');
    setEditDescription('');
  };

  const handleEditSave = () => {
    if (editName.trim()) {
      onUpdate(waypoint, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Waypoint name cannot be empty');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Waypoint',
      `Are you sure you want to delete "${waypoint.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(waypoint),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isOwner ? 'Your Waypoint' : `${waypoint.createdBy}'s Waypoint`}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Waypoint Info */}
            <View style={styles.content}>
              {isEditing ? (
                // Edit Mode
                <>
                  <Text style={styles.label}>Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Waypoint name"
                    maxLength={50}
                  />

                  <Text style={styles.label}>Description:</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="Description (optional)"
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                </>
              ) : (
                // View Mode
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{waypoint.name}</Text>
                  </View>

                  {waypoint.description ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Description:</Text>
                      <Text style={styles.value}>{waypoint.description}</Text>
                    </View>
                  ) : null}

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Location:</Text>
                    <Text style={styles.value}>
                      {waypoint.latitude.toFixed(6)}, {waypoint.longitude.toFixed(6)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Created:</Text>
                    <Text style={styles.value}>{formatDate(waypoint.createdAt)}</Text>
                  </View>

                  {!isOwner && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Created by:</Text>
                      <Text style={styles.value}>{waypoint.createdBy}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {isOwner ? (
                // Owner buttons (edit/delete)
                isEditing ? (
                  <>
                    <TouchableOpacity style={styles.saveButton} onPress={handleEditSave}>
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleEditCancel}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditStart}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )
              ) : (
                // Non-owner button (close only)
                <TouchableOpacity style={styles.closeOnlyButton} onPress={onClose}>
                  <Text style={styles.closeOnlyButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingTop: 0,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#9E9E9E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeOnlyButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeOnlyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});