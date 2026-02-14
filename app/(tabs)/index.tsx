import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getTheme } from '@/constants/theme';
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// Для начала используем фиксированную тему, позже добавим выбор
const currentTheme = getTheme('purple', false); // или 'blue', 'green'

interface Session {
  id: string;
  task: string;
  time: number;
  date: string;
  formattedTime: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = currentTheme; // Позже это будет динамическим
  
  const [stats, setStats] = useState({
    todayFocus: 85,
    weeklyGoal: 300,
    completed: 42,
    streak: 14,
    totalFocusTime: 12560,
  });

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

  const saveSessions = async (sessions: Session[]) => {
    try {
      await AsyncStorage.setItem('focusSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
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

  const quickActions = [
    { 
      icon: 'play-circle', 
      label: 'Start Timer', 
      color: theme.primary,
      action: () => router.push('/timer') 
    },
    { 
      icon: 'target', 
      label: 'Goals', 
      color: theme.warning,
      action: () => router.push('/goals')
    },
    { 
      icon: 'bar-chart', 
      label: 'Stats', 
      color: theme.success,
      action: () => router.push('/stats')
    },
    { 
      icon: 'settings', 
      label: 'Settings', 
      color: theme.secondary,
      action: () => router.push('/settings')
    },
  ];

  const goalProgress = Math.min(Math.round((stats.todayFocus / 120) * 100), 100);
  const weeklyProgress = Math.min(Math.round((stats.todayFocus / stats.weeklyGoal) * 100), 100);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ 
        light: theme.gradient[0], 
        dark: theme.background 
      }}
      headerImage={
        <Ionicons name="home" size={100} color="white" style={styles.headerImage} />
      }>
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={[styles.welcomeTitle, { color: theme.primary }]}>
          Welcome Back, Alex! 👋
        </ThemedText>
        <ThemedText style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
          Your focus dashboard
        </ThemedText>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.ctaContainer, { backgroundColor: theme.surface }]}
        onPress={() => router.push('/timer')}
      >
        <ThemedView style={styles.ctaContent}>
          <ThemedView style={[styles.ctaIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="play-circle" size={40} color="white" />
          </ThemedView>
          <ThemedView style={styles.ctaTextContainer}>
            <ThemedText type="title" style={[styles.ctaTitle, { color: theme.text }]}>
              Start Focus Session
            </ThemedText>
            <ThemedText style={[styles.ctaSubtitle, { color: theme.textSecondary }]}>
              Tap to begin a new focus timer
            </ThemedText>
          </ThemedView>
          <Ionicons name="chevron-forward" size={24} color={theme.primary} />
        </ThemedView>
      </TouchableOpacity>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </ThemedText>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.actionCard, { backgroundColor: theme.surface }]} 
              onPress={action.action}
            >
              <ThemedView style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Feather name={action.icon} size={24} color={action.color} />
              </ThemedView>
              <ThemedText style={[styles.actionLabel, { color: theme.text }]}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
            Focus Overview
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/stats')}>
            <ThemedText style={[styles.seeAll, { color: theme.secondary }]}>Details →</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={[styles.overviewCard, { backgroundColor: theme.surface }]}>
          <ThemedView style={styles.overviewRow}>
            <ThemedView style={styles.overviewItem}>
              <FontAwesome name="clock-o" size={20} color={theme.primary} />
              <ThemedText style={[styles.overviewValue, { color: theme.text }]}>
                {formatTotalTime(stats.totalFocusTime)}
              </ThemedText>
              <ThemedText style={[styles.overviewLabel, { color: theme.textSecondary }]}>
                Total Focus
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
            
            <ThemedView style={styles.overviewItem}>
              <AntDesign name="checkcircle" size={20} color={theme.success} />
              <ThemedText style={[styles.overviewValue, { color: theme.text }]}>
                {stats.completed}
              </ThemedText>
              <ThemedText style={[styles.overviewLabel, { color: theme.textSecondary }]}>
                Sessions
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.overviewDivider, { backgroundColor: theme.border }]} />
            
            <ThemedView style={styles.overviewItem}>
              <Ionicons name="flame" size={20} color={theme.warning} />
              <ThemedText style={[styles.overviewValue, { color: theme.text }]}>
                {stats.streak}
              </ThemedText>
              <ThemedText style={[styles.overviewLabel, { color: theme.textSecondary }]}>
                Day Streak
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.progressSection}>
            <ThemedView style={styles.progressHeader}>
              <ThemedText style={[styles.progressLabel, { color: theme.textSecondary }]}>
                Today's Progress
              </ThemedText>
              <ThemedText style={[styles.progressPercent, { color: theme.primary }]}>
                {goalProgress}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <ThemedView 
                style={[
                  styles.progressFill, 
                  { backgroundColor: theme.primary, width: `${goalProgress}%` }
                ]} 
              />
            </ThemedView>
            <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
              {stats.todayFocus} min of 120 min daily goal
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
            Weekly Progress
          </ThemedText>
          <ThemedText style={[styles.progressPercent, { color: theme.primary }]}>
            {weeklyProgress}%
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.weeklyCard, { backgroundColor: theme.surface }]}>
          <ThemedView style={styles.weeklyProgress}>
            <ThemedView style={[styles.weeklyProgressBar, { backgroundColor: theme.border }]}>
              <ThemedView 
                style={[
                  styles.weeklyProgressFill, 
                  { backgroundColor: theme.primary, width: `${weeklyProgress}%` }
                ]} 
              />
            </ThemedView>
            <ThemedText style={[styles.weeklyProgressText, { color: theme.textSecondary }]}>
              {stats.todayFocus} / {stats.weeklyGoal} minutes
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.weeklyStats}>
            <ThemedView style={styles.weeklyStat}>
              <Feather name="trending-up" size={16} color={theme.success} />
              <ThemedText style={[styles.weeklyStatValue, { color: theme.text }]}>
                +12%
              </ThemedText>
              <ThemedText style={[styles.weeklyStatLabel, { color: theme.textSecondary }]}>
                vs last week
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.weeklyStatDivider, { backgroundColor: theme.border }]} />
            
            <ThemedView style={styles.weeklyStat}>
              <Feather name="target" size={16} color={theme.primary} />
              <ThemedText style={[styles.weeklyStatValue, { color: theme.text }]}>
                4.2
              </ThemedText>
              <ThemedText style={[styles.weeklyStatLabel, { color: theme.textSecondary }]}>
                avg sessions/day
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Sessions {recentSessions.length > 0 && `(${recentSessions.length})`}
          </ThemedText>
          <TouchableOpacity onPress={clearAllSessions}>
            <ThemedText style={[styles.seeAll, { color: theme.secondary }]}>Clear All</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {recentSessions.length === 0 ? (
          <ThemedView style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Feather name="clock" size={48} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              No sessions yet
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              Start your first focus session!
            </ThemedText>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/timer')}
            >
              <ThemedText style={styles.emptyStateButtonText}>Start Timer</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={[styles.sessionsList, { backgroundColor: theme.surface }]}>
            {recentSessions.slice(0, 3).map((session) => (
              <TouchableOpacity 
                key={session.id} 
                style={[styles.sessionCard, { borderBottomColor: theme.border }]}
                onPress={() => Alert.alert('Session Details', `Task: ${session.task}\nDuration: ${session.formattedTime}\nDate: ${session.date}`)}
              >
                <ThemedView style={[styles.sessionIcon, { backgroundColor: theme.secondary + '20' }]}>
                  <MaterialIcons name="timer" size={20} color={theme.secondary} />
                </ThemedView>
                <ThemedView style={styles.sessionInfo}>
                  <ThemedText style={[styles.sessionTask, { color: theme.text }]}>
                    {session.task}
                  </ThemedText>
                  <ThemedText style={[styles.sessionDetails, { color: theme.textSecondary }]}>
                    {session.formattedTime} • {session.date}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity 
                  style={styles.sessionAction}
                  onPress={() => deleteSession(session.id)}
                >
                  <Feather name="trash-2" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {recentSessions.length > 3 && (
              <TouchableOpacity 
                style={[styles.viewAllButton, { borderTopColor: theme.border }]}
                onPress={() => router.push('/sessions')}
              >
                <ThemedText style={[styles.viewAllText, { color: theme.secondary }]}>
                  View all {recentSessions.length} sessions →
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={[styles.quoteContainer, { 
        backgroundColor: theme.background,
        borderLeftColor: theme.primary 
      }]}>
        <Ionicons name="quote" size={24} color={theme.secondary} style={styles.quoteIcon} />
        <ThemedText style={[styles.quoteText, { color: theme.text }]}>
          "Focus on being productive instead of busy."
        </ThemedText>
        <ThemedText style={[styles.quoteAuthor, { color: theme.textSecondary }]}>
          — Tim Ferriss
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// Стили остаются без изменений, только удаляем все жестко заданные цвета
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
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  headerImage: {
    position: 'absolute',
    top: 10,
    right: 30,
    opacity: 0.8,
  },
  ctaContainer: {
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
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
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
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  actionCard: {
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
    textAlign: 'center',
  },
  overviewCard: {
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
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
  },
  overviewDivider: {
    width: 1,
    height: 40,
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
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  weeklyCard: {
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
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  weeklyProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  weeklyProgressText: {
    fontSize: 12,
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
    marginTop: 4,
    marginBottom: 2,
  },
  weeklyStatLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  weeklyStatDivider: {
    width: 1,
    height: 30,
  },
  sessionsList: {
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
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 12,
  },
  sessionAction: {
    padding: 8,
  },
  viewAllButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quoteContainer: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
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