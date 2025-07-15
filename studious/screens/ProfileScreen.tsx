// user profile screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface UserStats {
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  groupsJoined: number;
  groupsCreated: number;
  likesReceived: number;
  averageSessionLength: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
}

interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'goals'>('stats');

  // Sample user data
  const userStats: UserStats = {
    totalSessions: 127,
    totalHours: 245,
    currentStreak: 12,
    longestStreak: 28,
    groupsJoined: 8,
    groupsCreated: 2,
    likesReceived: 89,
    averageSessionLength: 115, // minutes
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: 'checkmark-circle',
      isUnlocked: true,
      unlockedDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Study for 7 days in a row',
      icon: 'flame',
      isUnlocked: true,
      unlockedDate: '2024-02-03',
    },
    {
      id: '3',
      title: 'Century Club',
      description: 'Complete 100 study sessions',
      icon: 'trophy',
      isUnlocked: true,
      unlockedDate: '2024-06-20',
    },
    {
      id: '4',
      title: 'Marathon Master',
      description: 'Study for 5+ hours in a single day',
      icon: 'time',
      isUnlocked: false,
      progress: 3.5,
      maxProgress: 5,
    },
    {
      id: '5',
      title: 'Social Butterfly',
      description: 'Join 10 study groups',
      icon: 'people',
      isUnlocked: false,
      progress: 8,
      maxProgress: 10,
    },
    {
      id: '6',
      title: 'Knowledge Sharer',
      description: 'Get 100 likes on your study posts',
      icon: 'heart',
      isUnlocked: false,
      progress: 89,
      maxProgress: 100,
    },
  ];

  const studyGoals: StudyGoal[] = [
    {
      id: '1',
      title: 'Study 20 hours this month',
      target: 20,
      current: 14.5,
      unit: 'hours',
      deadline: '2025-07-31',
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Maintain 30-day streak',
      target: 30,
      current: 12,
      unit: 'days',
      deadline: '2025-08-15',
      isCompleted: false,
    },
    {
      id: '3',
      title: 'Join 5 new study groups',
      target: 5,
      current: 3,
      unit: 'groups',
      deadline: '2025-08-01',
      isCompleted: false,
    },
  ];

  // Format hours
  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Stats Card Component
  const StatCard = ({ title, value, subtitle, icon, color = '#007AFF' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  // Achievement Card Component
  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <View style={[styles.achievementCard, !achievement.isUnlocked && styles.lockedCard]}>
      <View style={styles.achievementHeader}>
        <View style={[
          styles.achievementIcon,
          { backgroundColor: achievement.isUnlocked ? '#10B981' : '#ccc' }
        ]}>
          <Ionicons 
            name={achievement.icon as any} 
            size={24} 
            color="white" 
          />
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            !achievement.isUnlocked && styles.lockedText
          ]}>
            {achievement.title}
          </Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
          {achievement.unlockedDate && (
            <Text style={styles.unlockedDate}>
              Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      
      {!achievement.isUnlocked && achievement.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.maxProgress}
          </Text>
        </View>
      )}
    </View>
  );

  // Goal Card Component
  const GoalCard = ({ goal }: { goal: StudyGoal }) => {
    const progressPercentage = (goal.current / goal.target) * 100;
    const isNearDeadline = new Date(goal.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={[
            styles.goalDeadline,
            isNearDeadline && styles.urgentDeadline
          ]}>
            Due {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.goalProgress}>
          <View style={styles.goalProgressBar}>
            <View 
              style={[
                styles.goalProgressFill,
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.goalProgressText}>
            {goal.current} / {goal.target} {goal.unit}
          </Text>
        </View>
        
        <Text style={styles.goalPercentage}>
          {Math.round(progressPercentage)}% Complete
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userUniversity}>Stanford University</Text>
          <Text style={styles.userMajor}>Computer Science • Junior</Text>
        </View>

        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['stats', 'achievements', 'goals'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'stats' && (
          <View style={styles.statsContainer}>
            {/* Main Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Study Sessions"
                value={userStats.totalSessions}
                icon="book-outline"
                color="#007AFF"
              />
              <StatCard
                title="Total Hours"
                value={formatHours(userStats.totalHours * 60)}
                icon="time-outline"
                color="#10B981"
              />
              <StatCard
                title="Current Streak"
                value={userStats.currentStreak}
                subtitle="days"
                icon="flame-outline"
                color="#F59E0B"
              />
              <StatCard
                title="Groups Joined"
                value={userStats.groupsJoined}
                icon="people-outline"
                color="#8B5CF6"
              />
            </View>

            {/* Additional Stats */}
            <View style={styles.additionalStats}>
              <Text style={styles.sectionTitle}>Study Insights</Text>
              
              <View style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Average Session</Text>
                  <Text style={styles.insightValue}>
                    {formatHours(userStats.averageSessionLength)}
                  </Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Longest Streak</Text>
                  <Text style={styles.insightValue}>{userStats.longestStreak} days</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Groups Created</Text>
                  <Text style={styles.insightValue}>{userStats.groupsCreated}</Text>
                </View>
                <View style={styles.insightRow}>
                  <Text style={styles.insightLabel}>Likes Received</Text>
                  <Text style={styles.insightValue}>{userStats.likesReceived}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            <Text style={styles.sectionSubtitle}>
              Unlock badges by reaching study milestones
            </Text>
            
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </View>
        )}

        {activeTab === 'goals' && (
          <View style={styles.goalsContainer}>
            <View style={styles.goalsHeader}>
              <Text style={styles.sectionTitle}>Study Goals</Text>
              <TouchableOpacity style={styles.addGoalButton}>
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.addGoalText}>Add Goal</Text>
              </TouchableOpacity>
            </View>
            
            {studyGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userUniversity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userMajor: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  additionalStats: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.6,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lockedText: {
    color: '#999',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  goalsContainer: {
    marginBottom: 20,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addGoalText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#666',
  },
  urgentDeadline: {
    color: '#EF4444',
    fontWeight: '500',
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  goalPercentage: {
    fontSize: 12,
    color: '#666',
  },
});