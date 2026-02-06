import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Vibration
} from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

// Тип для сессии
interface Session {
  id: string;
  task: string;
  time: number; // в секундах
  date: string;
  formattedTime: string;
}

type TimerMode = 'stopwatch' | 'countdown' | 'pomodoro';
type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export default function TimerScreen() {
  const router = useRouter();
  
  // Состояния для таймера
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [taskInput, setTaskInput] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(true);
  const [countdownTime, setCountdownTime] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  // Анимации
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Настройки Pomodoro
  const pomodoroSettings = {
    focusTime: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    pomodorosBeforeLongBreak: 4
  };

  // Цвета в зависимости от режима
  const getColors = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          primary: pomodoroPhase === 'focus' ? '#4A4CB1' : '#787BBC',
          secondary: pomodoroPhase === 'focus' ? '#5E60CE' : '#9D9AE5',
          light: pomodoroPhase === 'focus' ? '#EDEEFF' : '#F5F5FF',
          background: pomodoroPhase === 'focus' ? '#F0F1FF' : '#F8F9FF',
          text: '#2C2C54',
          mutedText: '#6C6C9C'
        };
      default:
        return {
          primary: '#4A4CB1',
          secondary: '#787BBC',
          light: '#EDEEFF',
          background: '#F0F1FF',
          text: '#2C2C54',
          mutedText: '#6C6C9C'
        };
    }
  };

  const colors = getColors();

  // Установка времени в зависимости от режима
  useEffect(() => {
    if (mode === 'countdown') {
      setSeconds(countdownTime);
    } else if (mode === 'pomodoro') {
      switch (pomodoroPhase) {
        case 'focus':
          setSeconds(pomodoroSettings.focusTime);
          break;
        case 'shortBreak':
          setSeconds(pomodoroSettings.shortBreak);
          break;
        case 'longBreak':
          setSeconds(pomodoroSettings.longBreak);
          break;
      }
    } else {
      setSeconds(0);
    }
  }, [mode, pomodoroPhase, countdownTime]);

  // Таймер
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'countdown' || mode === 'pomodoro') {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, mode]);

  // Анимация пульсации
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate([500, 500, 500]);
    }
    
    if (mode === 'pomodoro') {
      if (pomodoroPhase === 'focus') {
        const newCompleted = completedPomodoros + 1;
        setCompletedPomodoros(newCompleted);
        
        Alert.alert(
          '🎉 Focus Session Complete!',
          `Great work! You've completed ${newCompleted} pomodoro${newCompleted > 1 ? 's' : ''}.`,
          [
            {
              text: 'Take a Break',
              onPress: () => {
                if (newCompleted % pomodoroSettings.pomodorosBeforeLongBreak === 0) {
                  setPomodoroPhase('longBreak');
                } else {
                  setPomodoroPhase('shortBreak');
                }
                setIsActive(true);
              }
            },
            {
              text: 'Start Next Focus',
              style: 'cancel',
              onPress: () => {
                setPomodoroPhase('focus');
                setIsActive(true);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '⏰ Break Time Over!',
          'Your break is complete. Ready to focus again?',
          [
            {
              text: 'Start Focus',
              onPress: () => {
                setPomodoroPhase('focus');
                setIsActive(true);
              }
            },
            {
              text: 'Stop',
              style: 'destructive',
            }
          ]
        );
      }
    } else if (mode === 'countdown') {
      Alert.alert(
        '⏰ Time\'s Up!',
        `Your countdown timer has ended.${taskInput ? `\nTask: ${taskInput}` : ''}`,
        [
          {
            text: 'Save Session',
            onPress: saveCurrentSession
          },
          {
            text: 'Restart',
            onPress: () => {
              setSeconds(countdownTime);
              setIsActive(true);
            }
          }
        ]
      );
    }
  };

  const toggleTimer = () => {
    if ((mode === 'stopwatch' || mode === 'countdown') && !taskInput.trim()) {
      Alert.alert('Add Task', 'Please enter what you\'re focusing on!');
      return;
    }
    
    if (mode === 'countdown' && seconds === 0) {
      Alert.alert('Set Time', 'Please set a time for your countdown.');
      return;
    }
    
    setIsActive(!isActive);
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetTimer = () => {
    if (seconds > 0 && isActive) {
      Alert.alert(
        'Reset Timer',
        'Are you sure you want to reset the timer?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: handleReset
          },
        ]
      );
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    if (mode === 'countdown') {
      setSeconds(countdownTime);
    } else if (mode === 'pomodoro') {
      switch (pomodoroPhase) {
        case 'focus':
          setSeconds(pomodoroSettings.focusTime);
          break;
        case 'shortBreak':
          setSeconds(pomodoroSettings.shortBreak);
          break;
        case 'longBreak':
          setSeconds(pomodoroSettings.longBreak);
          break;
      }
    } else {
      setSeconds(0);
    }
    setIsActive(false);
  };

  

  const saveCurrentSession = async () => {
    if (seconds === 0 && mode !== 'stopwatch') {
      Alert.alert('No Time', 'Timer is at 0:00. Start the timer first!');
      return;
    }

    if (!taskInput.trim() && mode !== 'pomodoro') {
      Alert.alert('Add Task', 'Please enter what you were focusing on!');
      return;
    }

    const sessionTime = mode === 'pomodoro' ? pomodoroSettings.focusTime : seconds;
    const sessionTask = mode === 'pomodoro' ? `Pomodoro ${completedPomodoros + 1}` : taskInput;

    const newSession: Session = {
      id: Date.now().toString(),
      task: sessionTask,
      time: sessionTime,
      date: getCurrentDate(),
      formattedTime: formatTimeToMinutes(sessionTime)
    };

    try {
      const savedSessions = await AsyncStorage.getItem('focusSessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      const updatedSessions = [newSession, ...sessions.slice(0, 9)];
      await AsyncStorage.setItem('focusSessions', JSON.stringify(updatedSessions));
      
      Alert.alert(
        'Session Saved! 🎯',
        `Great job! You focused for ${newSession.formattedTime} on "${sessionTask}"`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeToMinutes = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const setCountdownMinutes = (minutes: number) => {
    if (isActive) return;
    const newTime = minutes * 60;
    setCountdownTime(newTime);
    setSeconds(newTime);
  };

  const switchMode = (newMode: TimerMode) => {
    if (isActive) {
      Alert.alert('Timer Running', 'Please stop the timer before changing mode.');
      return;
    }
    
    setMode(newMode);
    if (newMode === 'countdown') {
      setSeconds(countdownTime);
    } else if (newMode === 'pomodoro') {
      setPomodoroPhase('focus');
      setSeconds(pomodoroSettings.focusTime);
    } else {
      setSeconds(0);
      
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'stopwatch': return 'Stopwatch';
      case 'countdown': return 'Countdown Timer';
      case 'pomodoro': return 'Pomodoro Timer';
      default: return 'Timer';
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Заголовок */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
            {getModeTitle()}
          </ThemedText>
          
          <TouchableOpacity 
            style={[styles.saveButtonHeader, (seconds === 0 || isActive) && styles.disabledButton]}
            onPress={saveCurrentSession}
            disabled={seconds === 0 || isActive}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="save" size={20} color={seconds === 0 || isActive ? colors.mutedText : colors.primary} />
          </TouchableOpacity>
        </ThemedView>

        {/* Переключатель режимов */}
        <ThemedView style={styles.modeSelectorContainer}>
          <ThemedView style={[styles.modeSelector, { backgroundColor: colors.light }]}>
            {(['stopwatch', 'countdown', 'pomodoro'] as TimerMode[]).map((modeType) => (
              <TouchableOpacity 
                key={modeType}
                style={[
                  styles.modeButton,
                  mode === modeType && styles.modeButtonActive,
                  mode === modeType && { backgroundColor: colors.primary }
                ]}
                onPress={() => switchMode(modeType)}
                activeOpacity={0.7}
              >
                {modeType === 'stopwatch' && (
                  <FontAwesome 
                    name="stopwatch" 
                    size={16} 
                    color={mode === modeType ? 'white' : colors.mutedText} 
                  />
                )}
                {modeType === 'countdown' && (
                  <Ionicons 
                    name="timer-outline" 
                    size={16} 
                    color={mode === modeType ? 'white' : colors.mutedText} 
                  />
                )}
                {modeType === 'pomodoro' && (
                  <MaterialIcons 
                    name="local-cafe" 
                    size={16} 
                    color={mode === modeType ? 'white' : colors.mutedText} 
                  />
                )}
                <ThemedText style={[
                  styles.modeButtonText,
                  { color: mode === modeType ? 'white' : colors.mutedText },
                  mode === modeType && styles.modeButtonTextActive
                ]}>
                  {modeType === 'stopwatch' ? 'Stopwatch' : 
                   modeType === 'countdown' ? 'Countdown' : 'Pomodoro'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Основной таймер */}
        <Animated.View 
          style={[
            styles.timerContainer,
            {
              transform: [
                { scale: pulseAnim },
                { scale: fadeAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.timerCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={[styles.timerText, { color: 'white' }]}>
              {formatTime(seconds)}
            </ThemedText>
            
            {mode === 'pomodoro' && (
              <ThemedView style={styles.pomodoroInfo}>
                <ThemedView style={[
                  styles.pomodoroPhase,
                  { backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}>
                  <ThemedText style={[styles.pomodoroPhaseText]}>
                    {pomodoroPhase === 'focus' ? 'Focus Time' : 
                     pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </ThemedText>
                </ThemedView>
                
                {pomodoroPhase === 'focus' && (
                  <ThemedText style={[styles.pomodoroCount]}>
                    Session {completedPomodoros + 1}
                  </ThemedText>
                )}
              </ThemedView>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Быстрое добавление времени для countdown */}
        {mode === 'countdown' && (
          <ThemedView style={styles.quickTimeContainer}>
            <ThemedText style={[styles.quickTimeLabel, { color: colors.text }]}>
              Quick Set
            </ThemedText>
            <ThemedView style={styles.quickTimeButtons}>
              {[5, 10, 15, 25, 30].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.quickTimeButton,
                    { backgroundColor: colors.light },
                    countdownTime === minutes * 60 && { 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary
                    }
                  ]}
                  onPress={() => setCountdownMinutes(minutes)}
                  disabled={isActive}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    styles.quickTimeText,
                    { color: colors.mutedText },
                    countdownTime === minutes * 60 && styles.quickTimeTextActive,
                    isActive && styles.quickTimeTextDisabled
                  ]}>
                    {minutes}m
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        {/* Поле для задачи */}
        
          <ThemedView style={styles.taskContainer}>
            <ThemedView style={[styles.taskInputWrapper, { backgroundColor: colors.light }]}>
              <MaterialIcons name="work" size={20} color={colors.mutedText} />
              <TextInput
                style={[styles.taskInput, { color: colors.text }]}
                placeholder="What are you focusing on?"
                placeholderTextColor={colors.mutedText}
                value={taskInput}
                onChangeText={setTaskInput}
                onSubmitEditing={toggleTimer}
                returnKeyType="done"
              />
              {taskInput.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setTaskInput('')}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={18} color={colors.mutedText} />
                </TouchableOpacity>
              )}
            </ThemedView>
          </ThemedView>
        }

        {/* Кнопки управления */}
        <ThemedView style={styles.controlsContainer}>
          {/* Левая кнопка */}
          <TouchableOpacity
            style={[
              styles.sideControl,
              { backgroundColor: colors.light }
            ]}
            onPress={ 
                     mode === 'countdown' ? () => setCountdownMinutes(countdownTime/60 + 5) :
                     () => {
                       if (!isActive) {
                         setPomodoroPhase(pomodoroPhase === 'focus' ? 'shortBreak' : 'focus');
                       }
                     }}
            disabled={(mode === 'stopwatch' && !isActive) || (mode === 'countdown' && isActive)}
            activeOpacity={0.7}
          >
            {mode === 'stopwatch' ? (
              <FontAwesome name="flag" size={20} color={!isActive ? colors.mutedText : colors.primary} />
            ) : mode === 'countdown' ? (
              <Ionicons name="add" size={20} color={isActive ? colors.mutedText : colors.primary} />
            ) : (
              <MaterialIcons name="loop" size={20} color={isActive ? colors.mutedText : colors.primary} />
            )}
            <ThemedText style={[
              styles.sideControlText,
              { color: colors.mutedText },
              ((mode === 'stopwatch' && !isActive) || (mode === 'countdown' && isActive)) && styles.disabledText
            ]}>
              {mode === 'countdown' ? '+5 min' : 'Switch'}
            </ThemedText>
          </TouchableOpacity>

          {/* Центральная кнопка */}
          <TouchableOpacity
            style={styles.mainControlContainer}
            onPress={toggleTimer}
            disabled={mode !== 'pomodoro' && !taskInput.trim()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isActive ? ['#FF6B6B', '#FF8787'] : [colors.primary, colors.secondary]}
              style={[
                styles.mainControl,
                (mode !== 'pomodoro' && !taskInput.trim()) && styles.disabledButton
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={isActive ? 'pause' : 'play'} 
                size={32} 
                color="white" 
              />
            </LinearGradient>
            <ThemedText style={[styles.mainControlText, { color: colors.text }]}>
              {isActive ? 'Pause' : 'Start'}
            </ThemedText>
          </TouchableOpacity>

          {/* Правая кнопка */}
          <TouchableOpacity
            style={[
              styles.sideControl,
              { backgroundColor: colors.light }
            ]}
            onPress={resetTimer}
            disabled={seconds === 0 && mode !== 'stopwatch'}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={(seconds === 0 && mode !== 'stopwatch') ? colors.mutedText : colors.primary} 
            />
            <ThemedText style={[
              styles.sideControlText,
              { color: colors.mutedText },
              (seconds === 0 && mode !== 'stopwatch') && styles.disabledText
            ]}>
              Reset
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        

        {/* Статистика Pomodoro */}
        {mode === 'pomodoro' && (
          <ThemedView style={styles.statsContainer}>
            <ThemedView style={[styles.statsCard, { backgroundColor: colors.light }]}>
              <ThemedText style={[styles.statsTitle, { color: colors.text }]}>
                Today's Progress
              </ThemedText>
              <ThemedView style={styles.statsGrid}>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                    {completedPomodoros}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.mutedText }]}>
                    Sessions
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                    {completedPomodoros * 25}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.mutedText }]}>
                    Minutes
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                    {Math.floor(completedPomodoros / pomodoroSettings.pomodorosBeforeLongBreak)}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.mutedText }]}>
                    Long Breaks
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Подсказки по режимам */}
        <ThemedView style={styles.tipsContainer}>
          <ThemedText style={[styles.tipsTitle, { color: colors.mutedText }]}>
            Tips
          </ThemedText>
          {mode === 'countdown' && (
            <ThemedText style={[styles.tipsText, { color: colors.mutedText }]}>
              • Use quick set buttons to adjust timer before starting
            </ThemedText>
          )}
          {mode === 'pomodoro' && (
            <ThemedText style={[styles.tipsText, { color: colors.mutedText }]}>
              • After 4 focus sessions, take a longer 15-minute break
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

// Чистые, аккуратные стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  saveButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  modeSelectorContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timerCircle: {
    width: width * 0.3,
    height: width * 0.2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  timerText: {
    fontSize: width < 375 ? 48 : 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    includeFontPadding: false,
  },
  pomodoroInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  pomodoroPhase: {
  paddingHorizontal: 20,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.2)', 
},
  pomodoroPhaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C54',
  },
  pomodoroCount: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    color: 'black',
  },
  quickTimeContainer: {
    marginBottom: 25,
  },
  quickTimeLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 55,
    alignItems: 'center',
  },
  quickTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickTimeTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  quickTimeTextDisabled: {
    opacity: 0.3,
  },
  taskContainer: {
    marginBottom: 25,
  },
  taskInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  taskInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  sideControl: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 80,
  },
  sideControlText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  mainControlContainer: {
    alignItems: 'center',
  },
  mainControl: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  mainControlText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 25,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  tipsContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 18,
  },
});