import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0); 
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
        setTotalSeconds(prevTotal => prevTotal + 1);
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
    setSeconds(0);
    setIsActive(false);
  };
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#787bbcff', dark: '#40415aff' }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Timer ⏱️⏰🌸</ThemedText>
      </ThemedView>
      <ThemedView style={styles.timerContainer}>
        <ThemedText type="title" style={styles.timerText}>
          {formatTime(seconds)}
        </ThemedText>
        <ThemedView style={styles.timerButtons}>
          <TouchableOpacity
            style={[styles.button, isActive ? styles.pauseButton : styles.startButton]}
            onPress={toggleTimer}
          >
            <ThemedText style={styles.buttonText}>
              {isActive ? 'Pause' : 'Start'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetTimer}
          >
            <ThemedText style={styles.buttonText}>Reset</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statItem}>
          <ThemedText type="subtitle" style={styles.statLabel}>Total time:</ThemedText>
          <ThemedText type="title" style={styles.statValue}>
            {formatTotalTime(totalSeconds)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  timerContainer: {
    backgroundColor: '#000000',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#817bd4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 20,
    fontVariant: ['tabular-nums'], // Для одинаковой ширины цифр
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4c4eafff',
  },
  pauseButton: {
    backgroundColor: '#877dd2ff',
  },
  resetButton: {
    backgroundColor: '#575875ff',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statLabel: {
    color: '#666',
    fontSize: 16,
  },
  statValue: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});