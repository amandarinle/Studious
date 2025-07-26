// Study screen used to record study sessions and maybe learn new study techniques??
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Vibration, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode} from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';

interface StudyTechnique {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface StudySession {
  subject: string;
  technique: string;
  duration: number; // in minutes
  mood: string;
  notes: string;
  recordingType: 'none' | 'timelapse' | 'ai-evaluation';
  videoUri?: string; // for recordings
}

type StudyMode = 'selection' | 'recording-options' | 'active';
type RecordingType = 'none' | 'timelapse' | 'ai-evaluation';

const STUDY_TECHNIQUES: StudyTechnique[] = [
  {
    id: '1',
    name: 'Pomodoro Technique',
    description: '25 min focused work + 5 min break',
    icon: 'timer-outline',
  },
  {
    id: '2',
    name: 'Feynman Technique',
    description: 'Explain concepts like you are teachig someone',
    icon: 'chatbubble-outline',
  },
  {
    id: '3',
    name: 'Active Recall',
    description: 'Test yourself frequently',
    icon: 'help-circle-outline',
  },
  {
    id: '4',
    name: 'Standard',
    description: 'Review notes and materials, practice, stay focused',
    icon: 'book-outline',
  }
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'History', 'Literature', 'Economics', 'Psychology', 'Philosophy',
  'Engineering', 'Medicine', 'Law', 'Business', 'Art', 'Music', 'Other'
];

const MOODS = [
  { name: 'Focused', emoji: '🎯', color: '#10B981' },
  { name: 'Motivated', emoji: '💪', color: '#3B82F6' },
  { name: 'Energetic', emoji: '⚡', color: '#F59E0B' },
  { name: 'Calm', emoji: '😌', color: '#8B5CF6' },
  { name: 'Tired', emoji: '😴', color: '#6B7280' },
  { name: 'Stressed', emoji: '😰', color: '#EF4444' },
];

export default function StudyScreen() {
  // Timer state
  const [isStudying, setIsStudying] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState(0); // in seconds
  const [isPaused, setIsPaused] = React.useState(false);
  const [studyMode, setStudyMode] = React.useState<StudyMode>('selection');
  const [selectedRecordingType, setSelectedRecordingType] = React.useState<RecordingType>('none');
  const [waitingForVideo, setWaitingForVideo] = React.useState(false);
  
  // Session logging state
  const [showLogModal, setShowLogModal] = React.useState(false);
  const [sessionData, setSessionData] = React.useState<StudySession>({
    subject: '',
    technique: '',
    duration: 0,
    mood: '',
    notes: '',
    recordingType: 'none',
  });

  // Refs for timer
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Camera and video states
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = React.useState<string | null>(null);
  const [showVideoPreview, setShowVideoPreview] = React.useState(false);

  // Camera ref
  const cameraRef = React.useRef<CameraView>(null);

  // Timer effect
  React.useEffect(() => {
    if (isStudying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStudying, isPaused]);

  // Request camera and media library permissions
  React.useEffect(() => {
    const requestPermissions = async () => {
      if (!permission) {
        await requestPermission();
      }
      
      // Request media library permissions for saving videos
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to save videos');
      }
    };
    
    requestPermissions();
  }, [permission, requestPermission]);

  // Watch for video URI changes when we're waiting for it
  React.useEffect(() => {
    if (waitingForVideo && recordedVideoUri && (selectedRecordingType === 'timelapse' || selectedRecordingType === 'ai-evaluation')) {
      console.log('Video URI received while waiting, showing preview:', recordedVideoUri);
      setWaitingForVideo(false);
      setShowVideoPreview(true);
    } else if (waitingForVideo && recordedVideoUri === null) {
      // Still waiting, do nothing
    } else if (waitingForVideo) {
      // We were waiting but something went wrong or it's not a recording mode
      console.log('Was waiting for video but conditions not met, going to log modal');
      setWaitingForVideo(false);
      openLogModal();
    }
  }, [recordedVideoUri, waitingForVideo, selectedRecordingType]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Show recording options
  const showRecordingOptions = () => {
    setStudyMode('recording-options');
  };

  // Start study session with selected recording type
  const startStudyingWithRecording = async (recordingType: RecordingType) => {
    setSelectedRecordingType(recordingType);
    setIsStudying(true);
    setIsPaused(false);
    setStudyMode('active');
    
    if (recordingType === 'timelapse' || recordingType === 'ai-evaluation') {

      if (recordingType === 'ai-evaluation') { 
        Alert.alert(
          'AI Evaluation Recording Started',
          'Record yourself explaining concepts. The AI will analyze your understanding and provide feedback.',
          [{ text: 'Start Recording!' }]
        );
      }

      if (!permission?.granted) {
        Alert.alert('Camera Permission Required', 'Please grant camera permissions for time-lapse recording');
        await requestPermission();
        return;
      }
      
      // Start time-lapse recording immediately
      setTimeout(async () => {
        if (cameraRef.current) {
          try {
            setIsRecording(true);
            const video = await cameraRef.current.recordAsync({
              maxDuration: 86400, // 24 hour max
            });
            
            if (video && video.uri) {
              setRecordedVideoUri(video.uri);
            }
          } catch (error) {
            console.error('Recording failed:', error);
            Alert.alert('Recording Error', 'Failed to start time-lapse recording');
            setIsRecording(false);
          }
        }
      }, 500); // Small delay to ensure camera is ready
    }
    Vibration.vibrate(100);
  };

  // Pause/Resume study session
  const togglePause = () => {
    setIsPaused(prev => !prev);
    Vibration.vibrate(50);
  };

  // Stop and log session
  const stopAndLog = async () => {
    // Stop recording if active
    if (isRecording && cameraRef.current) {
      try {
        console.log('Stopping recording...');
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        console.log('Recording stopped manually');
        
        // If we're in a recording mode, wait for the video URI to be set
        if (selectedRecordingType === 'timelapse' || selectedRecordingType === 'ai-evaluation') {
          console.log('Setting waitingForVideo to true for recording type:', selectedRecordingType);
          setWaitingForVideo(true);
          
          // Reset timer states now
          setIsStudying(false);
          setIsPaused(false);
          setStudyMode('selection');
          
          // Clear timer interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // The useEffect will handle showing the video preview when recordedVideoUri is set
          return;
        }
      } catch (error) {
        console.error('Stop recording failed:', error);
      }
    }
    
    // For non-recording modes, go directly to existing flow
    if (elapsedTime < 60) {
      Alert.alert(
        'Short Session',
        'This session is quite short. Are you sure you want to log it?',
        [
          { text: 'Continue Studying', style: 'cancel' },
          { 
            text: 'Log Anyway', 
            onPress: () => {
              // Reset timer states
              setIsStudying(false);
              setIsPaused(false);
              setElapsedTime(0);
              setStudyMode('selection');
              
              // Clear timer interval
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              
              openLogModal();
            }
          },
        ]
      );
    } else {
      openLogModal();
    }
  };

  // Handle video preview confirmation
  const handleVideoPreviewDone = () => {
    setShowVideoPreview(false);
    setSessionData(prev => ({
      ...prev,
      videoUri: recordedVideoUri || '',
    }));
    openLogModal(); // Proceed to session logging
  };

  // Handle video preview retake
  const handleVideoRetake = () => {
    setShowVideoPreview(false);
    setRecordedVideoUri(null);
    // Restart the recording
    startStudyingWithRecording(selectedRecordingType);
  };

  // Open logging modal
  const openLogModal = () => {
    const currentDuration = Math.floor(elapsedTime / 60);
    const currentRecordingType = selectedRecordingType;
    const currentVideoUri = recordedVideoUri;

    
    // Reset timer states immediately
    setIsStudying(false);
    setIsPaused(false);
    setElapsedTime(0); // Reset blue timer display
    setStudyMode('selection'); // Exit any special modes
    
    // Clear timer interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Set session data with the values before reset
    setSessionData(prev => ({
      ...prev,
      duration: currentDuration,
      recordingType: currentRecordingType,
      videoUri: currentVideoUri || '',
    }));
    
    setShowLogModal(true);
  };


  // Reset timer
  const resetTimer = () => {
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the timer? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setIsStudying(false);
            setIsPaused(false);
            setElapsedTime(0);
            setStudyMode('selection');
            setSelectedRecordingType('none');
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        },
      ]
    );
  };

  // Save study session
  const saveSession = () => {
    if (!sessionData.subject || !sessionData.technique || !sessionData.mood) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Here you would save to your backend/database
    console.log('Saving session:', sessionData);
    
    let alertMessage = `Great job studying ${sessionData.subject} for ${sessionData.duration} minutes!`;
    
    if (sessionData.recordingType === 'ai-evaluation') {
      alertMessage += ' Your recording is being analyzed by AI for feedback.';
    } else if (sessionData.recordingType === 'timelapse') {
      alertMessage += ' Your time-lapse recording has been saved.';
    }
    
    Alert.alert('Session Logged! 🎉', alertMessage, [
      {
        text: 'Share to Feed',
        onPress: () => {
          console.log('Sharing to feed...');
          // Reset everything after sharing
          resetAllStates();
        }
      },
      { 
        text: 'Done', 
        style: 'default',
        onPress: () => {
          // Reset everything when done
          resetAllStates();
        }
      }
    ]);
  };

  // Helper function to reset all states
  const resetAllStates = () => {
    setShowLogModal(false);
    setIsStudying(false);
    setIsPaused(false);
    setElapsedTime(0);
    setStudyMode('selection');
    setSelectedRecordingType('none');
    
    // Clear timer interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Reset session data
    setSessionData({
      subject: '',
      technique: '',
      duration: 0,
      mood: '',
      notes: '',
      recordingType: 'none',
    });

    setWaitingForVideo(false);
  };

  // Recording Option Card Component
  const RecordingOptionCard = ({ 
    type, 
    title, 
    description, 
    icon, 
    color,
    recommended = false 
  }: {
    type: RecordingType;
    title: string;
    description: string;
    icon: string;
    color: string;
    recommended?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.recordingCard, recommended && styles.recommendedCard]}
      onPress={() => startStudyingWithRecording(type)}
    >
      {recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}
      <View style={[styles.recordingIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={32} color={color} />
      </View>
      <Text style={styles.recordingTitle}>{title}</Text>
      <Text style={styles.recordingDescription}>{description}</Text>
      <View style={styles.recordingButton}>
        <Text style={styles.recordingButtonText}>Start Session</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );

  // Study technique selector
  const TechniqueSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Study Technique</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {STUDY_TECHNIQUES.map(technique => (
          <TouchableOpacity
            key={technique.id}
            style={[
              styles.techniqueCard,
              sessionData.technique === technique.name && styles.selectedCard
            ]}
            onPress={() => setSessionData(prev => ({ ...prev, technique: technique.name }))}
          >
            <Ionicons 
              name={technique.icon as any} 
              size={24} 
              color={sessionData.technique === technique.name ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.techniqueTitle,
              sessionData.technique === technique.name && styles.selectedText
            ]}>
              {technique.name}
            </Text>
            <Text style={styles.techniqueDesc}>{technique.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  return (
    <View style={styles.container}>
       {/* Status Bar Control */}
      <StatusBar 
        hidden={studyMode === 'active' && (selectedRecordingType === 'none' || selectedRecordingType === 'timelapse')} 
      />
      {/* Full Screen Camera for Recording modes */}
      <Modal
        visible={studyMode === 'active' && (selectedRecordingType === 'timelapse' || selectedRecordingType === 'ai-evaluation') && !showVideoPreview}
        animationType="fade"
        presentationStyle="fullScreen"
      >
        <View style={styles.fullScreenCamera}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="video"
            >
              {/* Timer Overlay */}
              <View style={styles.cameraOverlay}>
                <View style={styles.timerOverlay}>
                  <Text style={styles.overlayTimer}>{formatTime(elapsedTime)}</Text>
                  <Text style={styles.overlayLabel}>
                      {isRecording 
                        ? (selectedRecordingType === 'timelapse' 
                            ? 'Recording Time-lapse...' 
                            : 'Recording for AI Analysis...'
                          )
                        : 'Preparing...'
                      }
                  </Text>
                </View>

                {/* Recording Indicator */}
                {isRecording && (
                  <View style={styles.recordingIndicatorOverlay}>
                    <View style={styles.recordingDotOverlay} />
                    <Text style={styles.recordingTextOverlay}>REC</Text>
                  </View>
                )}

                {/* Bottom Controls */}
                <View style={styles.cameraControls}>
                  <TouchableOpacity 
                    style={styles.cameraControlButton} 
                    onPress={togglePause}
                  >
                    <Ionicons 
                      name={isPaused ? "play" : "pause"} 
                      size={32} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.cameraControlButton, styles.stopCameraButton]} 
                    onPress={stopAndLog}
                  >
                    <Ionicons name="stop" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Camera permission is required</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Full Screen Timer Modal (standard session) */}
      <Modal
        visible={studyMode === 'active' && selectedRecordingType === 'none'}
        animationType="fade"
        presentationStyle="fullScreen"
      >
        <StatusBar hidden={true} />
        <View style={styles.fullScreenTimerModal}>
          {/* Timer Display */}
          <View style={styles.fullScreenTimerContent}>
            <Text style={styles.fullScreenTimeText}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.fullScreenLabel}>
              {isPaused ? 'Locked Out' : 'Locked In'}
            </Text>
            
            {/* Optional: Subject display */}
            {sessionData.subject && (
              <View style={styles.subjectDisplay}>
                <Text style={styles.subjectDisplayText}>
                  {sessionData.subject}
                </Text>
              </View>
            )}
          </View>

          {/* Minimalist Controls */}
          <View style={styles.fullScreenControls}>
            <TouchableOpacity 
              style={styles.fullScreenControlButton} 
              onPress={togglePause}
            >
              <Ionicons 
                name={isPaused ? "play" : "pause"} 
                size={36} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.fullScreenControlButton, styles.stopButtonFull]} 
              onPress={stopAndLog}
            >
              <Ionicons name="stop" size={36} color="white" />
            </TouchableOpacity>
          </View>

          {/* Exit button */}
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={() => {
              Alert.alert(
                'Exit Focus Mode',
                'Do you want to stop the timer or keep it running?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Keep Timer Running', 
                    onPress: () => setStudyMode('selection') // Just exit full-screen, keep timer
                  },
                  { 
                    text: 'Stop Timer', 
                    style: 'destructive',
                    onPress: () => {
                      // Stop everything
                      setStudyMode('selection');
                      setIsStudying(false);
                      setIsPaused(false);
                      setElapsedTime(0);
                      setSelectedRecordingType('none');
                      if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>

          {/* Swipe indicator */}
          <View style={styles.swipeIndicator}>
            <Text style={styles.swipeText}>Swipe up for controls</Text>
          </View>
        </View>
      </Modal>
      
      {/* Video Preview Modal */}
      <Modal
        visible={showVideoPreview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.videoPreviewContainer}>
          <View style={styles.videoPreviewHeader}>
            <Text style={styles.videoPreviewTitle}>
              {selectedRecordingType === 'timelapse' ? 'Time-lapse Preview' : 'AI Analysis Preview'}
            </Text>
            <Text style={styles.videoPreviewSubtitle}>
              {formatTime(elapsedTime)} study session recorded
            </Text>
          </View>

          {recordedVideoUri && (
            <Video
              source={{ uri: recordedVideoUri }}
              style={styles.videoPreview}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              rate={sessionData.recordingType === 'timelapse' ? 2.5 : 1.0} // Time-lapse speed
            />
          )}

          <View style={styles.videoPreviewActions}>
            <TouchableOpacity 
              style={styles.retakeButton} 
              onPress={handleVideoRetake}
            >
              <Ionicons name="refresh" size={20} color="#666" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.useVideoButton} 
              onPress={handleVideoPreviewDone}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.useVideoButtonText}>Use This Video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Regular Screen Mode */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Timer Section */}
        <View style={styles.timerSection}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.timerLabel}>
              {studyMode === 'selection' ? 'Ready to study?' : 
              studyMode === 'recording-options' ? 'Choose recording mode' :
              !isStudying ? 'Ready to study?' : 
              isPaused ? 'Paused' : 
              selectedRecordingType === 'timelapse' ? 'Recording time-lapse...' :
              'Recording for AI evaluation...'}
            </Text>
          </View>

          {/* Timer Controls */}
          <View style={styles.timerControls}>
            {studyMode === 'selection' && (
              <TouchableOpacity style={styles.startButton} onPress={showRecordingOptions}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.startButtonText}>Start Study Session</Text>
              </TouchableOpacity>
            )}

            {studyMode === 'recording-options' && (
              <View style={styles.recordingOptions}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStudyMode('selection')}
                >
                  <Ionicons name="arrow-back" size={20} color="#666" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.recordingGrid}>
                  <RecordingOptionCard
                    type="none"
                    title="Full-Screen Focus"
                    description="Immersive full-screen timer for maximum concentration"
                    icon="eye-off-outline"
                    color="#007AFF"
                  />

                  <RecordingOptionCard
                    type="timelapse"
                    title="Time-lapse Recording"
                    description="Create a time-lapse video of your study session to review later"
                    icon="videocam-outline"
                    color="#10B981"
                  />

                  <RecordingOptionCard
                    type="ai-evaluation"
                    title="AI Study Assistant"
                    description="Record yourself explaining concepts for AI analysis and feedback"
                    icon="mic-outline"
                    color="#F59E0B"
                  />
                </View>
              </View>
            )}

            {studyMode === 'active' && selectedRecordingType !== 'none' && (
              <View style={styles.activeControls}>
                <TouchableOpacity style={styles.controlButton} onPress={togglePause}>
                  <Ionicons name={isPaused ? "play" : "pause"} size={20} color="#007AFF" />
                  <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.stopButton} onPress={stopAndLog}>
                  <Ionicons name="stop" size={20} color="white" />
                  <Text style={styles.stopButtonText}>Stop & Log</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
                  <Ionicons name="refresh" size={20} color="#666" />
                  <Text style={[styles.controlButtonText, { color: '#666' }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Recording Status */}
          {studyMode === 'active' && selectedRecordingType !== 'none' && (
            <View style={styles.recordingStatus}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingStatusText}>
                  {selectedRecordingType === 'timelapse' ? 'Time-lapse Recording' : 'AI Analysis Recording'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Study Techniques - only show when not in active mode */}
        {studyMode !== 'active' && <TechniqueSelector />}

        {/* Quick Stats - only show when not in active mode */}
        {studyMode !== 'active' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>4h 20m</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Logging Modal */}
      <Modal
        visible={showLogModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Study Session</Text>
            <TouchableOpacity onPress={saveSession}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Duration Display */}
            <View style={styles.durationDisplay}>
              <Text style={styles.durationText}>{sessionData.duration} minutes</Text>
              <Text style={styles.durationLabel}>Study Duration</Text>
              
              {/* Video Preview in Logging Modal */}
              {sessionData.videoUri && (sessionData.recordingType === 'timelapse' || sessionData.recordingType === 'ai-evaluation') && (
                <View style={styles.videoPreviewInModal}>
                  <Video
                    source={{ uri: sessionData.videoUri }}
                    style={styles.modalVideoPreview}
                    useNativeControls={false} // No controls for preview
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping={true}
                    isMuted={true} // Muted autoplay like social media
                    rate={sessionData.recordingType === 'timelapse' ? 2.5 : 1.0} // Time-lapse speed
                  />
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play" size={24} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.videoOverlayText}>
                      {sessionData.recordingType === 'timelapse' ? 'Time-lapse' : 'AI Analysis'}
                    </Text>
                  </View>
                </View>
              )}
              
              {sessionData.recordingType !== 'none' && (
                <View style={styles.recordingBadge}>
                  <Ionicons 
                    name={sessionData.recordingType === 'timelapse' ? 'videocam' : 'mic'} 
                    size={16} 
                    color="white" 
                  />
                  <Text style={styles.recordingBadgeText}>
                    {sessionData.recordingType === 'timelapse' ? 'Time-lapse' : 'AI Analysis'}
                  </Text>
                </View>
              )}
            </View>

            {/* Subject Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Subject *</Text>
              
              {/* Custom Subject Input */}
              <TextInput
                style={styles.subjectInput}
                placeholder="Enter subject (e.g., Calculus II, Organic Chemistry)"
                value={sessionData.subject}
                onChangeText={(subject) => setSessionData(prev => ({ ...prev, subject }))}
                autoCapitalize="words"
              />
              
              {/* Quick Selection Pills */}
              <Text style={styles.quickSelectLabel}>Quick select:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.subjectContainer}>
                  {SUBJECTS.map(subject => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectChip,
                        sessionData.subject === subject && styles.selectedChip
                      ]}
                      onPress={() => setSessionData(prev => ({ ...prev, subject }))}
                    >
                      <Text style={[
                        styles.chipText,
                        sessionData.subject === subject && styles.selectedChipText
                      ]}>
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Technique Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Technique Used *</Text>
              <View style={styles.techniqueGrid}>
                {STUDY_TECHNIQUES.map(technique => (
                  <TouchableOpacity
                    key={technique.id}
                    style={[
                      styles.techniqueOption,
                      sessionData.technique === technique.name && styles.selectedOption
                    ]}
                    onPress={() => setSessionData(prev => ({ ...prev, technique: technique.name }))}
                  >
                    <Ionicons 
                      name={technique.icon as any} 
                      size={20} 
                      color={sessionData.technique === technique.name ? '#007AFF' : '#666'} 
                    />
                    <Text style={[
                      styles.optionText,
                      sessionData.technique === technique.name && styles.selectedOptionText
                    ]}>
                      {technique.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>How did you feel? *</Text>
              <View style={styles.moodGrid}>
                {MOODS.map(mood => (
                  <TouchableOpacity
                    key={mood.name}
                    style={[
                      styles.moodOption,
                      sessionData.mood === mood.name && { backgroundColor: mood.color + '20' }
                    ]}
                    onPress={() => setSessionData(prev => ({ ...prev, mood: mood.name }))}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodText,
                      sessionData.mood === mood.name && { color: mood.color }
                    ]}>
                      {mood.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="What did you learn? Any insights?"
                value={sessionData.notes}
                onChangeText={(notes) => setSessionData(prev => ({ ...prev, notes }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
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
  scrollView: {
    flex: 1,
  },
  timerSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  timerControls: {
    width: '100%',
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingOptions: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 6,
  },
  recordingGrid: {
    gap: 16,
  },
  recordingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  recommendedCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recordingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  recordingDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  recordingButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  recordingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 4,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
  },
  recordingStatus: {
    marginTop: 16,
    width: '100%',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF444420',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingStatusText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  techniqueCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#007AFF10',
    borderColor: '#007AFF',
  },
  techniqueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedText: {
    color: '#007AFF',
  },
  techniqueDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  durationDisplay: {
    alignItems: 'center',
    backgroundColor: '#007AFF10',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    position: 'relative',
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  recordingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subjectInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  quickSelectLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
  },
  subjectChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChip: {
    backgroundColor: '#007AFF10',
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
  techniqueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techniqueOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#007AFF10',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 12,
    color: '#666',
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
  },
  fullScreenTimerModal: {
  flex: 1,
  backgroundColor: '#000', // Pure black for maximum focus
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  position: 'relative',
  },
  fullScreenTimerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  fullScreenTimeText: {
    fontSize: 84,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  fullScreenLabel: {
    fontSize: 22,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '300',
  },
  subjectDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  subjectDisplayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  fullScreenControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    gap: 60,
  },
  fullScreenControlButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopButtonFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  exitButton: {
  position: 'absolute',
  top: 60,
  right: 20,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  swipeIndicator: {
  position: 'absolute',
  bottom: 30,
  left: 0,
  right: 0,
  alignItems: 'center',
  },
  swipeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '300',
  },
  // Full-screen camera styles
  fullScreenCamera: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  timerOverlay: {
    alignItems: 'center',
    marginTop: 60,
  },
  overlayTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recordingIndicatorOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recordingDotOverlay: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  recordingTextOverlay: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    marginBottom: 40,
  },
  cameraControlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopCameraButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 40,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Video preview styles
  videoPreviewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  videoPreviewHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  videoPreviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  videoPreviewSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  videoPreview: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPreviewActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  retakeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  useVideoButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  useVideoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  videoPreviewInModal: {
  width: '100%',
  height: 120,
  borderRadius: 12,
  marginTop: 16,
  overflow: 'hidden',
  position: 'relative',
  },
  modalVideoPreview: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlayText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});