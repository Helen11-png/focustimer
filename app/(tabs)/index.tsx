import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

// Тип для сессии
interface Session {
  id: string;
  task: string;
  time: number; // в секундах
  date: string;
  formattedTime: string;
}

export default function HomeScreen() {
  // Состояния для таймера
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(12560);
  const [isActive, setIsActive] = useState(false);
  const [taskInput, setTaskInput] = useState('');

  // Данные для статистики
  const [stats, setStats] = useState({
    todayFocus: 85, // минут
    weeklyGoal: 300, // минут
    completed: 42,
    streak: 14,
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

  // Сохранение сессий в AsyncStorage
  const saveSessions = async (sessions: Session[]) => {
    try {
      await AsyncStorage.setItem('focusSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

  // Таймер
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
        setTotalSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (seconds > 0) {
      Alert.alert(
        'Save Session?',
        `You have ${formatTime(seconds)} recorded. Do you want to save this session?`,
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setSeconds(0);
              setIsActive(false);
            }
          },
          {
            text: 'Save',
            style: 'default',
            onPress: () => saveCurrentSession()
          }
        ]
      );
    } else {
      setSeconds(0);
      setIsActive(false);
    }
  };

  const saveCurrentSession = () => {
    if (seconds === 0) {
      Alert.alert('No Time', 'Timer is at 0:00. Start the timer first!');
      return;
    }

    if (!taskInput.trim()) {
      Alert.alert('Add Task', 'Please enter what you were focusing on!');
      return;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      task: taskInput,
      time: seconds,
      date: getCurrentDate(),
      formattedTime: formatTimeToMinutes(seconds)
    };

    const updatedSessions = [newSession, ...recentSessions.slice(0, 9)]; // Храним последние 10 сессий
    setRecentSessions(updatedSessions);
    saveSessions(updatedSessions);
    
    // Обновляем статистику
    const minutes = Math.floor(seconds / 60);
    setStats(prev => ({
      ...prev,
      todayFocus: prev.todayFocus + minutes,
      completed: prev.completed + 1
    }));

    // Сброс
    setSeconds(0);
    setIsActive(false);
    setTaskInput('');
    
    Alert.alert('Session Saved!', `Great job! You focused for ${newSession.formattedTime} on "${taskInput}"`);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeToMinutes = (totalSeconds: number) => {
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

  const getCurrentDate = () => {
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (now.toDateString() === today.toDateString()) {
      return `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (now.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
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
    { icon: 'play-circle', label: 'Start Focus', color: '#4c4eaf', action: () => setIsActive(true) },
    { icon: 'save', label: 'Save Session', color: '#4ECDC4', action: saveCurrentSession },
    { icon: 'target', label: 'Set Goal', color: '#FF6B6B' },
    { icon: 'bar-chart', label: 'Stats', color: '#4ECDC4' },
    { icon: 'trash-2', label: 'Clear All', color: '#FF6B6B', action: clearAllSessions },
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#787bbcff', dark: '#40415aff' }}
      headerImage={
        <Ionicons name="home" size={100} color="white" style={styles.headerImage} />
      }>
      
      {/* Приветствие */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.welcomeTitle}>Welcome Back, Alex! 👋</ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>Ready for another productive day?</ThemedText>
      </ThemedView>

      {/* Главный таймер */}
      <ThemedView style={styles.timerContainer}>
        <ThemedText style={styles.timerLabel}>Current Session</ThemedText>
        <ThemedText type="title" style={styles.timerText}>
          {formatTime(seconds)}
        </ThemedText>
        
        <ThemedView style={styles.timerButtons}>
          <TouchableOpacity
            style={[styles.button, isActive ? styles.pauseButton : styles.startButton]}
            onPress={toggleTimer}>
            <Ionicons name={isActive ? 'pause' : 'play'} size={20} color="white" />
            <ThemedText style={styles.buttonText}>
              {isActive ? 'Pause' : 'Start'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetTimer}>
            <Ionicons name="refresh" size={20} color="white" />
            <ThemedText style={styles.buttonText}>Reset/Save</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Поле для ввода задачи */}
        <ThemedView style={styles.taskInputContainer}>
          <MaterialIcons name="work" size={20} color="#787bbc" />
          <TextInput
            style={styles.taskInput}
            placeholder="What are you focusing on?"
            placeholderTextColor="#999"
            value={taskInput}
            onChangeText={setTaskInput}
            onSubmitEditing={isActive ? undefined : saveCurrentSession}
            editable={!isActive}
          />
          {taskInput ? (
            <TouchableOpacity onPress={() => setTaskInput('')}>
              <Feather name="x-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : (
            <Feather name="edit-2" size={18} color="#999" />
          )}
        </ThemedView>

        {/* Подсказка */}
        {!taskInput && !isActive && (
          <ThemedText style={styles.hintText}>
            Enter a task above, then start the timer!
          </ThemedText>
        )}
        {isActive && (
          <ThemedText style={[styles.hintText, { color: '#4c4eaf' }]}>
            Focusing on: {taskInput || "Add task description"}
          </ThemedText>
        )}
      </ThemedView>

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

      {/* Статистика */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Progress</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.seeAll}>See All →</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statCard}>
            <FontAwesome name="clock-o" size={24} color="#4c4eaf" />
            <ThemedText style={styles.statValue}>{formatMinutes(stats.todayFocus)}</ThemedText>
            <ThemedText style={styles.statDescription}>Today's Focus</ThemedText>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${(stats.todayFocus / 120) * 100}%` }]} />
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <MaterialIcons name="flag" size={24} color="#4c4eaf" />
            <ThemedText style={styles.statValue}>{Math.round((stats.todayFocus / stats.weeklyGoal) * 100)}%</ThemedText>
            <ThemedText style={styles.statDescription}>Weekly Goal</ThemedText>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${(stats.todayFocus / stats.weeklyGoal) * 100}%` }]} />
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <ThemedText style={styles.statValue}>{stats.streak}</ThemedText>
            <ThemedText style={styles.statDescription}>Day Streak</ThemedText>
            <ThemedText style={styles.streakSubtext}>Keep it up! 🔥</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <AntDesign name="checkcircle" size={24} color="#4ECDC4" />
            <ThemedText style={styles.statValue}>{stats.completed}</ThemedText>
            <ThemedText style={styles.statDescription}>Sessions Done</ThemedText>
            <ThemedText style={styles.streakSubtext}>This month</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Последние сессии */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Sessions {recentSessions.length > 0 && `(${recentSessions.length})`}
          </ThemedText>
          {recentSessions.length > 0 && (
            <TouchableOpacity onPress={clearAllSessions}>
              <ThemedText style={styles.seeAll}>Clear All</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
        
        {recentSessions.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Feather name="clock" size={48} color="#ccc" />
            <ThemedText style={styles.emptyStateText}>No sessions yet</ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Start a timer and save your first focus session!
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.sessionsList}>
            {recentSessions.map((session) => (
              <ThemedView key={session.id} style={styles.sessionCard}>
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
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      {/* Мотивационная цитата */}
      <ThemedView style={styles.quoteContainer}>
        <Ionicons name="quote" size={24} color="#787bbc" style={styles.quoteIcon} />
        <ThemedText style={styles.quoteText}>
          "The future depends on what you do today."
        </ThemedText>
        <ThemedText style={styles.quoteAuthor}>— Mahatma Gandhi</ThemedText>
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
  timerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 120,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#4c4eaf',
  },
  pauseButton: {
    backgroundColor: '#877dd2',
  },
  resetButton: {
    backgroundColor: '#575875',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 12,
  },
  taskInput: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  statDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4c4eaf',
    borderRadius: 3,
  },
  streakSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
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
  taskInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
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
  },

});