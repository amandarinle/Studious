// Home/Feed
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode} from 'expo-av';

// Define types for our data structures
interface StudySession {
  id: string;
  user: {
    name: string;
    avatar: string;
    university: string;
  };
  subject: string;
  duration: number; // in minutes
  technique?: string;
  location?: string;
  mood: 'focused' | 'motivated' | 'tired' | 'energetic';
  notes?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  videoUri?: string;
  recordingType?: 'none' | 'timelapse' | 'ai-evaluation';
}

export default function HomeScreen() {
  const [studySessions, setStudySessions] = React.useState<StudySession[]>([
    {
      id: '1',
      user: {
        name: 'Nathan Chen',
        avatar: 'NC',
        university: 'University of Texas at Austin',
      },
      subject: 'Accounting',
      duration: 135, // 2h 15m
      technique: 'Feynman Technique',
      mood: 'focused',
      location: 'PCL Study Room',
      notes: 'Reviewed financial statements and practice problems.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 12,
      comments: 3,
      isLiked: false,
    },
    {
      id: '2',
      user: {
        name: 'Alex Rodriguez',
        avatar: 'AR',
        university: 'MIT',
      },
      subject: 'Organic Chemistry',
      duration: 105, // 1h 45m
      technique: 'Active Recall',
      mood: 'motivated',
      notes: 'Working through synthesis problems. Getting better!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 8,
      comments: 1,
      isLiked: true,
    },
    {
      id: '3',
      user: {
        name: 'Maya Patel',
        avatar: 'MP',
        university: 'UC Berkeley',
      },
      subject: 'Data Structures',
      duration: 90,
      technique: 'Pomodoro + Coding',
      mood: 'energetic',
      notes: 'Implemented a binary search tree from scratch!',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 15,
      comments: 5,
      isLiked: false,
    },
  ]);

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper function to format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMins}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Get mood color
  const getMoodColor = (mood: string): string => {
    switch (mood) {
      case 'focused': return '#10B981'; // green
      case 'motivated': return '#3B82F6'; // blue
      case 'energetic': return '#F59E0B'; // orange
      case 'tired': return '#6B7280'; // gray
      default: return '#6B7280';
    }
  };

  // Handle like button press
  const handleLike = (sessionId: string) => {
    setStudySessions(prev => 
      prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            isLiked: !session.isLiked,
            likes: session.isLiked ? session.likes - 1 : session.likes + 1,
          };
        }
        return session;
      })
    );
  };

  // Study Session Card Component
  const StudySessionCard = ({ session }: { session: StudySession }) => (
    <View style={styles.card}>
      {/* Header with user info */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: '#007AFF' }]}>
            <Text style={styles.avatarText}>{session.user.avatar}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{session.user.name}</Text>
            <Text style={styles.university}>{session.user.university}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(session.timestamp)}</Text>
          </View>
        </View>
        <View style={styles.duration}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.durationText}>{formatDuration(session.duration)}</Text>
        </View>
      </View>

      {/* Study session details */}
      <View style={styles.sessionDetails}>
        <View style={styles.subjectRow}>
          <Ionicons name="book-outline" size={18} color="#007AFF" />
          <Text style={styles.subject}>{session.subject}</Text>
        </View>

        <View style={styles.techniqueRow}>
          <Ionicons name="bulb-outline" size={16} color="#666" />
          <Text style={styles.technique}>Used: {session.technique}</Text>
        </View>

        <View style={styles.moodRow}>
          <Text style={styles.moodLabel}>Feeling:</Text>
          <View style={[styles.moodBadge, { backgroundColor: getMoodColor(session.mood) + '20' }]}>
            <Text style={[styles.moodText, { color: getMoodColor(session.mood) }]}>
              {session.mood}
            </Text>
          </View>
        </View>

        {session.notes && (
          <Text style={styles.notes}>"{session.notes}"</Text>
        )}
      </View>
      
      {/* Video Preview in Feed */}
      {session.videoUri && session.recordingType === 'timelapse' && (
        <View style={styles.feedVideoContainer}>
          <Video
            source={{ uri: session.videoUri }}
            style={styles.feedVideo}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false} // User taps to play
            isLooping={true}
            isMuted={true}
            rate={4.0}
          />
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(session.id)}
        >
          <Ionicons 
            name={session.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={session.isLiked ? "#EF4444" : "#666"} 
          />
          <Text style={[styles.actionText, { color: session.isLiked ? "#EF4444" : "#666" }]}>
            {session.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{session.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Feed header */}
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Recent Study Sessions</Text>
          <Text style={styles.feedSubtitle}>See what your study community is up to</Text>
        </View>

        {/* Study sessions */}
        {studySessions.map(session => (
          <StudySessionCard key={session.id} session={session} />
        ))}

        {/* Load more button */}
        <View style={styles.loadMore}>
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load More Sessions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  feedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  feedSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  university: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  sessionDetails: {
    marginBottom: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  technique: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 6,
    color: '#666',
  },
  loadMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '600',
  },
  feedVideoContainer: {
  width: '100%',
  height: 200,
  borderRadius: 12,
  overflow: 'hidden',
  marginVertical: 12,
  position: 'relative',
  backgroundColor: '#000',
  },
  feedVideo: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});