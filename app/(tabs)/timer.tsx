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
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  
  // Анимации
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const modeSwitchAnim = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  
  // Цвета для градиента
  const purpleGradient = ['#787bbc', '#9d9ae5', '#c5c3ff'];
  const darkPurpleGradient = ['#4c4eaf', '#787bbc', '#9d9ae5'];
  const focusGradient = ['#4c4eaf', '#787bbc'];
  const breakGradient = ['#c5c3ff', '#9d9ae5'];

  // Настройки Pomodoro
  const pomodoroSettings = {
    focusTime: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    pomodorosBeforeLongBreak: 4
  };

  // Анимация градиента
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

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
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
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
      Animated.timing(timerScaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(timerScaleAnim, {
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
      setLapTimes([]);
    }
    setIsActive(false);
  };

  const addLap = () => {
    if (mode === 'stopwatch' && isActive) {
      setLapTimes(prev => [...prev, seconds]);
    }
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
    
    Animated.spring(modeSwitchAnim, {
      toValue: newMode === 'stopwatch' ? 0 : newMode === 'countdown' ? 1 : 2,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
    
    setMode(newMode);
    if (newMode === 'countdown') {
      setSeconds(countdownTime);
    } else if (newMode === 'pomodoro') {
      setPomodoroPhase('focus');
      setSeconds(pomodoroSettings.focusTime);
    } else {
      setSeconds(0);
      setLapTimes([]);
    }
  };

  const getCurrentGradient = () => {
    if (mode === 'pomodoro') {
      return pomodoroPhase === 'focus' ? focusGradient : breakGradient;
    }
    return isActive ? darkPurpleGradient : purpleGradient;
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
    <LinearGradient
      colors={getCurrentGradient()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Заголовок */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText type="title" style={styles.title}>
            {getModeTitle()}
          </ThemedText>
          
          <TouchableOpacity 
            style={[styles.saveButtonHeader, (seconds === 0 || isActive) && styles.disabledButton]}
            onPress={saveCurrentSession}
            disabled={seconds === 0 || isActive}
          >
            <Feather name="save" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>

        {/* Переключатель режимов */}
        <ThemedView style={styles.modeSelector}>
          <Animated.View 
            style={[
              styles.modeIndicator,
              {
                transform: [{
                  translateX: modeSwitchAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, width / 3, (width / 3) * 2]
                  })
                }]
              }
            ]}
          />
          
          {(['stopwatch', 'countdown', 'pomodoro'] as TimerMode[]).map((modeType) => (
            <TouchableOpacity 
              key={modeType}
              style={styles.modeButton}
              onPress={() => switchMode(modeType)}
              activeOpacity={0.7}
            >
              {modeType === 'stopwatch' && (
                <FontAwesome 
                  name="stopwatch" 
                  size={18} 
                  color={mode === modeType ? 'white' : 'rgba(255,255,255,0.7)'} 
                />
              )}
              {modeType === 'countdown' && (
                <Ionicons 
                  name="timer-outline" 
                  size={18} 
                  color={mode === modeType ? 'white' : 'rgba(255,255,255,0.7)'} 
                />
              )}
              {modeType === 'pomodoro' && (
                <MaterialIcons 
                  name="local-cafe" 
                  size={18} 
                  color={mode === modeType ? 'white' : 'rgba(255,255,255,0.7)'} 
                />
              )}
              <ThemedText style={[
                styles.modeButtonText,
                mode === modeType && styles.modeButtonTextActive
              ]}>
                {modeType === 'stopwatch' ? 'Stopwatch' : 
                 modeType === 'countdown' ? 'Countdown' : 'Pomodoro'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Отображение таймера */}
        <Animated.View 
          style={[
            styles.timerContainer,
            {
              transform: [
                { scale: timerScaleAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <ThemedText style={styles.timerText}>
            {formatTime(seconds)}
          </ThemedText>
          
          {mode === 'pomodoro' && (
            <ThemedView style={styles.pomodoroInfo}>
              <ThemedView style={[
                styles.pomodoroPhase,
                pomodoroPhase === 'focus' && styles.pomodoroPhaseFocus,
                pomodoroPhase === 'shortBreak' && styles.pomodoroPhaseShortBreak,
                pomodoroPhase === 'longBreak' && styles.pomodoroPhaseLongBreak,
              ]}>
                <ThemedText style={styles.pomodoroPhaseText}>
                  {pomodoroPhase === 'focus' ? 'Focus Time' : 
                   pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </ThemedText>
              </ThemedView>
              
              {pomodoroPhase === 'focus' && (
                <ThemedText style={styles.pomodoroCount}>
                  Pomodoro {completedPomodoros + 1}
                </ThemedText>
              )}
            </ThemedView>
          )}
        </Animated.View>

        {/* Секция задачи */}
        <ThemedView style={styles.taskSection}>
          {mode !== 'pomodoro' && (
            <>
              {showTaskInput ? (
                <ThemedView style={styles.taskInputContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.taskInputWrapper}
                  >
                    <MaterialIcons name="work" size={20} color="rgba(255,255,255,0.9)" />
                    <TextInput
                      style={styles.taskInput}
                      placeholder="What are you focusing on?"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={taskInput}
                      onChangeText={setTaskInput}
                      onSubmitEditing={toggleTimer}
                      returnKeyType="done"
                    />
                    {taskInput.length > 0 && (
                      <TouchableOpacity 
                        onPress={() => setTaskInput('')}
                        style={styles.clearButton}
                      >
                        <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
                      </TouchableOpacity>
                    )}
                  </LinearGradient>
                </ThemedView>
              ) : (
                <TouchableOpacity 
                  style={styles.taskPreview}
                  onPress={() => setShowTaskInput(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.taskPreviewGradient}
                  >
                    <MaterialIcons name="work" size={16} color="rgba(255,255,255,0.9)" />
                    <ThemedText style={styles.taskPreviewText} numberOfLines={1}>
                      {taskInput || 'Add task'}
                    </ThemedText>
                    <Feather name="edit-2" size={14} color="rgba(255,255,255,0.6)" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}
        </ThemedView>

        {/* Быстрое добавление времени для countdown */}
        {mode === 'countdown' && (
          <ThemedView style={styles.quickTimeContainer}>
            <ThemedText style={styles.quickTimeLabel}>Quick Set</ThemedText>
            <ThemedView style={styles.quickTimeButtons}>
              {[5, 10, 15, 25, 30].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.quickTimeButton,
                    countdownTime === minutes * 60 && styles.quickTimeButtonActive
                  ]}
                  onPress={() => setCountdownMinutes(minutes)}
                  disabled={isActive}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[
                    styles.quickTimeText,
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

        {/* Кнопки управления */}
        <ThemedView style={styles.controlButtons}>
          {/* Левая кнопка */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.sideButton,
              (mode === 'stopwatch' && !isActive) && styles.disabledButton
            ]}
            onPress={mode === 'stopwatch' ? addLap : 
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
              <FontAwesome name="flag" size={20} color={!isActive ? 'rgba(255,255,255,0.3)' : 'white'} />
            ) : mode === 'countdown' ? (
              <Ionicons name="add" size={20} color={isActive ? 'rgba(255,255,255,0.3)' : 'white'} />
            ) : (
              <MaterialIcons name="loop" size={20} color={isActive ? 'rgba(255,255,255,0.3)' : 'white'} />
            )}
            <ThemedText style={[
              styles.controlButtonText,
              (mode === 'stopwatch' && !isActive) && styles.disabledText,
              (mode === 'countdown' && isActive) && styles.disabledText
            ]}>
              {mode === 'stopwatch' ? 'Lap' : 
               mode === 'countdown' ? '+5min' : 'Switch'}
            </ThemedText>
          </TouchableOpacity>

          {/* Центральная кнопка */}
          <TouchableOpacity
            style={styles.mainButtonContainer}
            onPress={toggleTimer}
            disabled={mode !== 'pomodoro' && !taskInput.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isActive ? ['#877dd2', '#a59cff'] : ['#4c4eaf', '#787bbc']}
              style={[
                styles.mainButton,
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
            <ThemedText style={styles.mainButtonText}>
              {isActive ? 'Pause' : 'Start'}
            </ThemedText>
          </TouchableOpacity>

          {/* Правая кнопка */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.sideButton,
              (seconds === 0 && mode !== 'stopwatch') && styles.disabledButton
            ]}
            onPress={resetTimer}
            disabled={seconds === 0 && mode !== 'stopwatch'}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={(seconds === 0 && mode !== 'stopwatch') ? 'rgba(255,255,255,0.3)' : 'white'} 
            />
            <ThemedText style={[
              styles.controlButtonText,
              (seconds === 0 && mode !== 'stopwatch') && styles.disabledText
            ]}>
              Reset
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Отображение кругов */}
        {mode === 'stopwatch' && lapTimes.length > 0 && (
          <ThemedView style={styles.lapContainer}>
            <ThemedText style={styles.lapTitle}>Laps ({lapTimes.length})</ThemedText>
            <ScrollView 
              style={styles.lapList} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.lapListContent}
            >
              {[...lapTimes].reverse().map((lapTime, index) => (
                <ThemedView key={index} style={styles.lapItem}>
                  <ThemedText style={styles.lapNumber}>
                    Lap {lapTimes.length - index}
                  </ThemedText>
                  <ThemedText style={styles.lapTime}>
                    {formatTime(lapTime)}
                  </ThemedText>
                </ThemedView>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {/* Статистика Pomodoro */}
        {mode === 'pomodoro' && (
          <ThemedView style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.statsCard}
            >
              <ThemedText style={styles.statsTitle}>Today's Progress</ThemedText>
              <ThemedView style={styles.statsGrid}>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statValue}>{completedPomodoros}</ThemedText>
                  <ThemedText style={styles.statLabel}>Sessions</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statValue}>
                    {completedPomodoros * 25}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Minutes</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statValue}>
                    {Math.floor(completedPomodoros / pomodoroSettings.pomodorosBeforeLongBreak)}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Long Breaks</ThemedText>
                </ThemedView>
              </ThemedView>
            </LinearGradient>
          </ThemedView>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// Улучшенные стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  saveButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: 'rgba(255,255,255,0.3)',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginVertical: 20,
    height: 56,
    position: 'relative',
  },
  modeIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    height: 48,
    width: (width - 40) / 3 - 8,
    top: 4,
    left: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  modeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  timerText: {
    fontSize: 68,
    fontWeight: '700',
    color: 'white',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pomodoroPhaseFocus: {
    backgroundColor: 'rgba(76, 78, 175, 0.3)',
  },
  pomodoroPhaseShortBreak: {
    backgroundColor: 'rgba(197, 195, 255, 0.3)',
  },
  pomodoroPhaseLongBreak: {
    backgroundColor: 'rgba(157, 154, 229, 0.3)',
  },
  pomodoroPhaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  pomodoroCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  taskSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  taskInputContainer: {
    width: '100%',
  },
  taskInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  taskInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  taskPreview: {
    width: '100%',
  },
  taskPreviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  taskPreviewText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  quickTimeContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickTimeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickTimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 60,
    alignItems: 'center',
  },
  quickTimeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quickTimeText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  quickTimeTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  quickTimeTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  sideButton: {
    alignItems: 'center',
    padding: 10,
    minWidth: 70,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginTop: 6,
  },
  mainButtonContainer: {
    alignItems: 'center',
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
  },
  lapContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    maxHeight: 200,
  },
  lapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  lapList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  lapListContent: {
    paddingVertical: 8,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lapNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  lapTime: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});