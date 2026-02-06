import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// Тип для сессии
interface Session {
  id: string;
  task: string;
  time: number; // в секундах
  date: string;
  formattedTime: string;
}

export default function HomeScreen() {
  const router = useRouter();
  
  // Данные для статистики
  const [stats, setStats] = useState({
    todayFocus: 85, // минут
    weeklyGoal: 300, // минут
    completed: 42,
    streak: 14,
    totalFocusTime: 12560, // в секундах
  });

  // Хранение сессий
  const [recentSessions, setRecentSessions] = useState<Session[]>([
    { id: '1', task: 'Work Project', time: 2700, date: 'Today, 10:30 AM', formattedTime: '45 min' },
    { id: '2', task: 'Study Session', time: 3600, date: 'Yesterday, 2:00 PM', formattedTime: '60 min' },
    { id: '3', task: 'Reading', time: 1800, date: 'Mar 12, 8:00 PM', formattedTime: '30 min' },
    { id: '4', task: 'Coding Practice', time: 5400, date: 'Mar 11, 3:30 PM', formattedTime: '90 min' },
  ]);

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  const loadSessions = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('focusSessions');
      if (savedSessions) {
        setRecentSessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('focusStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Сохранение сессий в AsyncStorage
  const saveSessions = async (sessions: Session[]) => {
    try {
      await AsyncStorage.setItem('focusSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

  const formatTimeToMinutes = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const formatMinutes = (minutes: number) => {
    return `${minutes} min`;
  };

  const deleteSession = (id: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedSessions = recentSessions.filter(session => session.id !== id);
            setRecentSessions(updatedSessions);
            saveSessions(updatedSessions);
          }
        }
      ]
    );
  };

  const clearAllSessions = () => {
    Alert.alert(
      'Clear All Sessions',
      'Are you sure you want to delete all sessions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            setRecentSessions([]);
            await AsyncStorage.removeItem('focusSessions');
          }
        }
      ]
    );
  };

  // Быстрые действия
  const quickActions = [
    { 
      icon: 'play-circle', 
      label: 'Start Timer', 
      color: '#4c4eaf', 
      action: () => router.push('/timer') 
    },
    { 
      icon: 'target', 
      label: 'Goals', 
      color: '#FF6B6B',
      action: () => router.push('/goals')
    },
    { 
      icon: 'bar-chart', 
      label: 'Stats', 
      color: '#4ECDC4',
      action: () => router.push('/stats')
    },
    { 
      icon: 'settings', 
      label: 'Settings', 
      color: '#575875',
      action: () => router.push('/settings')
    },
  ];

  // Прогресс цели
  const goalProgress = Math.round((stats.todayFocus / 120) * 100); // 120 минут - дневная цель
  const weeklyProgress = Math.round((stats.todayFocus / stats.weeklyGoal) * 100);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#787bbcff', dark: '#40415aff' }}
      headerImage={
        <Ionicons name="home" size={100} color="white" style={styles.headerImage} />
      }>
      
      {/* Приветствие */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.welcomeTitle}>Welcome Back, Alex! 👋</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>Your focus dashboard</ThemedText>
      </ThemedView>

      {/* Главный призыв к действию */}
      <TouchableOpacity 
        style={styles.ctaContainer}
        onPress={() => router.push('/timer')}
      >
        <ThemedView style={styles.ctaContent}>
          <ThemedView style={styles.ctaIcon}>
            <Ionicons name="play-circle" size={40} color="white" />
          </ThemedView>
          <ThemedView style={styles.ctaTextContainer}>
            <ThemedText type="title" style={styles.ctaTitle}>Start Focus Session</ThemedText>
            <ThemedText style={styles.ctaSubtitle}>Tap to begin a new focus timer</ThemedText>
          </ThemedView>
          <Ionicons name="chevron-forward" size={24} color="#4c4eaf" />
        </ThemedView>
      </TouchableOpacity>

      {/* Быстрые действия */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.actionCard} 
              onPress={action.action}
            >
              <ThemedView style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Feather name={action.icon} size={24} color={action.color} />
              </ThemedView>
              <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Общая статистика */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Focus Overview</ThemedText>
          <TouchableOpacity onPress={() => router.push('/stats')}>
            <ThemedText style={styles.seeAll}>Details →</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={styles.overviewCard}>
          <ThemedView style={styles.overviewRow}>
            <ThemedView style={styles.overviewItem}>
              <FontAwesome name="clock-o" size={20} color="#4c4eaf" />
              <ThemedText style={styles.overviewValue}>{formatTotalTime(stats.totalFocusTime)}</ThemedText>
              <ThemedText style={styles.overviewLabel}>Total Focus</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.overviewDivider} />
            
            <ThemedView style={styles.overviewItem}>
              <AntDesign name="checkcircle" size={20} color="#4ECDC4" />
              <ThemedText style={styles.overviewValue}>{stats.completed}</ThemedText>
              <ThemedText style={styles.overviewLabel}>Sessions</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.overviewDivider} />
            
            <ThemedView style={styles.overviewItem}>
              <Ionicons name="flame" size={20} color="#FF6B6B" />
              <ThemedText style={styles.overviewValue}>{stats.streak}</ThemedText>
              <ThemedText style={styles.overviewLabel}>Day Streak</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.progressSection}>
            <ThemedView style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>Today's Progress</ThemedText>
              <ThemedText style={styles.progressPercent}>{goalProgress}%</ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${goalProgress}%` }]} />
            </ThemedView>
            <ThemedText style={styles.progressText}>
              {stats.todayFocus} min of 120 min daily goal
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Достижения на этой неделе */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Weekly Progress</ThemedText>
          <ThemedText style={styles.progressPercent}>{weeklyProgress}%</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.weeklyCard}>
          <ThemedView style={styles.weeklyProgress}>
            <ThemedView style={styles.weeklyProgressBar}>
              <ThemedView style={[styles.weeklyProgressFill, { width: `${weeklyProgress}%` }]} />
            </ThemedView>
            <ThemedText style={styles.weeklyProgressText}>
              {stats.todayFocus} / {stats.weeklyGoal} minutes
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.weeklyStats}>
            <ThemedView style={styles.weeklyStat}>
              <Feather name="trending-up" size={16} color="#06D6A0" />
              <ThemedText style={styles.weeklyStatValue}>+12%</ThemedText>
              <ThemedText style={styles.weeklyStatLabel}>vs last week</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.weeklyStatDivider} />
            
            <ThemedView style={styles.weeklyStat}>
              <Feather name="target" size={16} color="#4c4eaf" />
              <ThemedText style={styles.weeklyStatValue}>4.2</ThemedText>
              <ThemedText style={styles.weeklyStatLabel}>avg sessions/day</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Последние сессии */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Sessions {recentSessions.length > 0 && `(${recentSessions.length})`}
          </ThemedText>
          <TouchableOpacity onPress={clearAllSessions}>
            <ThemedText style={styles.seeAll}>Clear All</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {recentSessions.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Feather name="clock" size={48} color="#ccc" />
            <ThemedText style={styles.emptyStateText}>No sessions yet</ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Start your first focus session!
            </ThemedText>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => router.push('/timer')}
            >
              <ThemedText style={styles.emptyStateButtonText}>Start Timer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.sessionsList}>
            {recentSessions.slice(0, 3).map((session) => (
              <TouchableOpacity 
                key={session.id} 
                style={styles.sessionCard}
                onPress={() => Alert.alert('Session Details', `Task: ${session.task}\nDuration: ${session.formattedTime}\nDate: ${session.date}`)}
              >
                <ThemedView style={styles.sessionIcon}>
                  <MaterialIcons name="timer" size={20} color="#787bbc" />
                </ThemedView>
                <ThemedView style={styles.sessionInfo}>
                  <ThemedText style={styles.sessionTask}>{session.task}</ThemedText>
                  <ThemedText style={styles.sessionDetails}>
                    {session.formattedTime} • {session.date}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity 
                  style={styles.sessionAction}
                  onPress={() => deleteSession(session.id)}
                >
                  <Feather name="trash-2" size={20} color="#999" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {recentSessions.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/sessions')}
              >
                <ThemedText style={styles.viewAllText}>
                  View all {recentSessions.length} sessions →
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        )}
      </ThemedView>

      {/* Мотивационная цитата */}
      <ThemedView style={styles.quoteContainer}>
        <Ionicons name="quote" size={24} color="#787bbc" style={styles.quoteIcon} />
        <ThemedText style={styles.quoteText}>
          "Focus on being productive instead of busy."
        </ThemedText>
        <ThemedText style={styles.quoteAuthor}>— Tim Ferriss</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#787bbc',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerImage: {
    position: 'absolute',
    top: 10,
    right: 30,
    opacity: 0.8,
  },
  ctaContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4c4eaf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#787bbc',
    fontWeight: '500',
  },
  actionsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginRight: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  progressSection: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    color: '#4c4eaf',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4c4eaf',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  weeklyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyProgress: {
    marginBottom: 20,
  },
  weeklyProgressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  weeklyProgressFill: {
    height: '100%',
    backgroundColor: '#4c4eaf',
    borderRadius: 5,
  },
  weeklyProgressText: {
    fontSize: 12,
    color: '#666',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyStat: {
    alignItems: 'center',
    flex: 1,
  },
  weeklyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  weeklyStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  weeklyStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  sessionsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#787bbc20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTask: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 12,
    color: '#999',
  },
  sessionAction: {
    padding: 8,
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewAllText: {
    fontSize: 14,
    color: '#787bbc',
    fontWeight: '500',
  },
  quoteContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#787bbc',
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#4c4eaf',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});