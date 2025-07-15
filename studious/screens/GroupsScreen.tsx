// study group screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  university: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  nextSession?: {
    date: string;
    time: string;
    topic: string;
  };
  admin: {
    name: string;
    avatar: string;
  };
  tags: string[];
  isJoined: boolean;
  isOwned: boolean;
}

interface NewGroupData {
  name: string;
  description: string;
  subject: string;
  maxMembers: number;
  isPublic: boolean;
  tags: string[];
}

const SAMPLE_GROUPS: StudyGroup[] = [
  {
    id: '1',
    name: 'CS 101 Study Group',
    description: 'Learning data structures and algorithms together. We meet twice a week for coding practice and concept review.',
    subject: 'Computer Science',
    university: 'Stanford University',
    memberCount: 15,
    maxMembers: 20,
    isPublic: true,
    nextSession: {
      date: 'Today',
      time: '7:00 PM',
      topic: 'Binary Trees & Traversal'
    },
    admin: {
      name: 'Sarah Chen',
      avatar: 'SC'
    },
    tags: ['algorithms', 'coding', 'beginner-friendly'],
    isJoined: true,
    isOwned: false,
  },
  {
    id: '2',
    name: 'Organic Chemistry Masters',
    description: 'Advanced organic chemistry study group for pre-med students. Focus on reaction mechanisms and synthesis.',
    subject: 'Chemistry',
    university: 'MIT',
    memberCount: 8,
    maxMembers: 12,
    isPublic: false,
    nextSession: {
      date: 'Tomorrow',
      time: '2:00 PM',
      topic: 'Aromatic Compounds'
    },
    admin: {
      name: 'Alex Rodriguez',
      avatar: 'AR'
    },
    tags: ['pre-med', 'advanced', 'mechanisms'],
    isJoined: false,
    isOwned: false,
  },
  {
    id: '3',
    name: 'Calculus Study Squad',
    description: 'Collaborative learning for Calculus II. We solve problems together and explain concepts to each other.',
    subject: 'Mathematics',
    university: 'UC Berkeley',
    memberCount: 12,
    maxMembers: 15,
    isPublic: true,
    nextSession: {
      date: 'Wednesday',
      time: '6:30 PM',
      topic: 'Integration Techniques'
    },
    admin: {
      name: 'Maya Patel',
      avatar: 'MP'
    },
    tags: ['calculus', 'problem-solving', 'collaborative'],
    isJoined: false,
    isOwned: true,
  },
];

const SUBJECTS = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Engineering', 'Economics', 'Psychology', 'History', 'Literature', 'Other'
];

export default function GroupsScreen() {
  const [groups, setGroups] = useState<StudyGroup[]>(SAMPLE_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'joined' | 'public' | 'private'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState<NewGroupData>({
    name: '',
    description: '',
    subject: '',
    maxMembers: 15,
    isPublic: true,
    tags: [],
  });

  // Filter groups based on search and filter criteria
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'joined':
        return matchesSearch && group.isJoined;
      case 'public':
        return matchesSearch && group.isPublic;
      case 'private':
        return matchesSearch && !group.isPublic;
      default:
        return matchesSearch;
    }
  });

  // Join/Leave group
  const handleJoinToggle = (groupId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newIsJoined = !group.isJoined;
        return {
          ...group,
          isJoined: newIsJoined,
          memberCount: newIsJoined ? group.memberCount + 1 : group.memberCount - 1,
        };
      }
      return group;
    }));
  };

  // Create new group
  const createGroup = () => {
    if (!newGroupData.name || !newGroupData.description || !newGroupData.subject) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      ...newGroupData,
      university: 'Your University', // This would come from user profile
      memberCount: 1,
      admin: {
        name: 'You',
        avatar: 'YU'
      },
      isJoined: true,
      isOwned: true,
    };

    setGroups(prev => [newGroup, ...prev]);
    setShowCreateModal(false);
    setNewGroupData({
      name: '',
      description: '',
      subject: '',
      maxMembers: 15,
      isPublic: true,
      tags: [],
    });

    Alert.alert('Group Created! 🎉', 'Your study group has been created successfully.');
  };

  // Group Card Component
  const GroupCard = ({ group }: { group: StudyGroup }) => (
    <View style={styles.groupCard}>
      {/* Header */}
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <View style={styles.groupTitleRow}>
            <Text style={styles.groupName}>{group.name}</Text>
            {group.isOwned && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.groupSubject}>{group.subject}</Text>
          <Text style={styles.groupUniversity}>{group.university}</Text>
        </View>
        <View style={[styles.privacyBadge, { backgroundColor: group.isPublic ? '#10B981' : '#6B7280' }]}>
          <Ionicons 
            name={group.isPublic ? "globe-outline" : "lock-closed-outline"} 
            size={12} 
            color="white" 
          />
          <Text style={styles.privacyText}>{group.isPublic ? 'Public' : 'Private'}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.groupDescription}>{group.description}</Text>

      {/* Tags */}
      {group.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {group.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.groupStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.statText}>{group.memberCount}/{group.maxMembers} members</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.statText}>Admin: {group.admin.name}</Text>
        </View>
      </View>

      {/* Next Session */}
      {group.nextSession && (
        <View style={styles.nextSession}>
          <View style={styles.sessionHeader}>
            <Ionicons name="calendar-outline" size={16} color="#007AFF" />
            <Text style={styles.sessionTitle}>Next Session</Text>
          </View>
          <Text style={styles.sessionDetails}>
            {group.nextSession.date} at {group.nextSession.time}
          </Text>
          <Text style={styles.sessionTopic}>Topic: {group.nextSession.topic}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.groupActions}>
        <TouchableOpacity
          style={[
            styles.joinButton,
            group.isJoined && styles.joinedButton,
            group.memberCount >= group.maxMembers && !group.isJoined && styles.fullButton
          ]}
          onPress={() => handleJoinToggle(group.id)}
          disabled={group.memberCount >= group.maxMembers && !group.isJoined}
        >
          <Ionicons 
            name={group.isJoined ? "checkmark" : "add"} 
            size={16} 
            color={group.isJoined ? "#10B981" : "white"} 
          />
          <Text style={[
            styles.joinButtonText,
            group.isJoined && styles.joinedButtonText
          ]}>
            {group.memberCount >= group.maxMembers && !group.isJoined 
              ? 'Full' 
              : group.isJoined 
                ? 'Joined' 
                : 'Join Group'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewButton}>
          <Ionicons name="eye-outline" size={16} color="#007AFF" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {(['all', 'joined', 'public', 'private'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilter
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Create Group Button */}
      <View style={styles.createSection}>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.createButtonText}>Create Study Group</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <ScrollView style={styles.groupsList} showsVerticalScrollIndicator={false}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Groups Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search terms' : 'Create or join your first study group!'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Study Group</Text>
            <TouchableOpacity onPress={createGroup}>
              <Text style={styles.saveButton}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Group Name */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter group name..."
                value={newGroupData.name}
                onChangeText={(name) => setNewGroupData(prev => ({ ...prev, name }))}
              />
            </View>

            {/* Subject */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.subjectContainer}>
                  {SUBJECTS.map(subject => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectChip,
                        newGroupData.subject === subject && styles.selectedChip
                      ]}
                      onPress={() => setNewGroupData(prev => ({ ...prev, subject }))}
                    >
                      <Text style={[
                        styles.chipText,
                        newGroupData.subject === subject && styles.selectedChipText
                      ]}>
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Describe your study group's goals and meeting style..."
                value={newGroupData.description}
                onChangeText={(description) => setNewGroupData(prev => ({ ...prev, description }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Max Members */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Maximum Members</Text>
              <View style={styles.memberSelector}>
                {[10, 15, 20, 25, 30].map(count => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.memberOption,
                      newGroupData.maxMembers === count && styles.selectedOption
                    ]}
                    onPress={() => setNewGroupData(prev => ({ ...prev, maxMembers: count }))}
                  >
                    <Text style={[
                      styles.memberOptionText,
                      newGroupData.maxMembers === count && styles.selectedOptionText
                    ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Privacy Setting */}
            <View style={styles.inputSection}>
              <View style={styles.privacyRow}>
                <View style={styles.privacyInfo}>
                  <Text style={styles.inputLabel}>Public Group</Text>
                  <Text style={styles.privacyDescription}>
                    Anyone can discover and join this group
                  </Text>
                </View>
                <Switch
                  value={newGroupData.isPublic}
                  onValueChange={(isPublic) => setNewGroupData(prev => ({ ...prev, isPublic }))}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  createSection: {
    padding: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  groupsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ownerBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  ownerText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  groupSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  groupUniversity: {
    fontSize: 12,
    color: '#666',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privacyText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  nextSession: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  sessionDetails: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sessionTopic: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  joinedButton: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  fullButton: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  joinedButtonText: {
    color: '#10B981',
  },
  viewButton: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  subjectContainer: {
    flexDirection: 'row',
  },
  subjectChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChip: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  selectedChipText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  memberSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  memberOptionText: {
    fontSize: 16,
    color: '#666',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});