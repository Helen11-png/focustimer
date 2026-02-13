// app/(tabs)/settings.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCurrentTheme } from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default function SettingsScreen() {
  const [currentTheme, setCurrentTheme] = useState('purple');
  const [isDark, setIsDark] = useState(false);

  // Загружаем сохраненную тему
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      
      if (savedTheme) setCurrentTheme(savedTheme);
      if (savedDarkMode) setIsDark(JSON.parse(savedDarkMode));
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const changeTheme = async (themeName: string) => {
    setCurrentTheme(themeName);
    await AsyncStorage.setItem('appTheme', themeName);
    Alert.alert('Theme Changed', `Theme set to ${themeName}`);
  };

  const toggleDarkMode = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
  };

  const theme = getCurrentTheme(currentTheme, isDark);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок */}
      <LinearGradient
        colors={theme.gradient}
        style={styles.header}
      >
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Customize your app</ThemedText>
      </LinearGradient>

      {/* Темная тема */}
      <ThemedView style={[styles.section, { backgroundColor: theme.surface }]}>
        <ThemedView style={styles.sectionHeader}>
          <Feather name="moon" size={20} color={theme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Dark Mode
          </ThemedText>
        </ThemedView>

        <TouchableOpacity 
          style={styles.option}
          onPress={toggleDarkMode}
        >
          <ThemedText style={[styles.optionText, { color: theme.text }]}>
            {isDark ? 'Disable Dark Mode' : 'Enable Dark Mode'}
          </ThemedText>
          <ThemedView style={[
            styles.toggle,
            isDark && { backgroundColor: theme.primary }
          ]}>
            <ThemedView style={[
              styles.toggleHandle,
              isDark && styles.toggleHandleActive
            ]} />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>

      {/* Выбор темы */}
      <ThemedView style={[styles.section, { backgroundColor: theme.surface }]}>
        <ThemedView style={styles.sectionHeader}>
          <Feather name="palette" size={20} color={theme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Color Theme
          </ThemedText>
        </ThemedView>

        {[
          { id: 'purple', name: 'Deep Purple', color: '#4c4eaf' },
          { id: 'blue', name: 'Ocean Blue', color: '#2563eb' },
          { id: 'green', name: 'Forest Green', color: '#2d6a4f' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.themeOption,
              { backgroundColor: theme.background },
              currentTheme === item.id && { 
                borderColor: item.color, 
                borderWidth: 2,
                backgroundColor: theme.surface 
              }
            ]}
            onPress={() => changeTheme(item.id)}
          >
            <ThemedView style={[styles.themePreview, { backgroundColor: item.color }]} />
            <ThemedText style={[styles.themeName, { color: theme.text }]}>
              {item.name}
            </ThemedText>
            {currentTheme === item.id && (
              <Feather name="check" size={20} color={item.color} />
            )}
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Предпросмотр цветов */}
      <ThemedView style={[styles.section, { backgroundColor: theme.surface }]}>
        <ThemedView style={styles.sectionHeader}>
          <Feather name="eye" size={20} color={theme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Preview
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.previewRow}>
          <ThemedView style={[styles.previewItem, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.previewText}>Primary</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.previewItem, { backgroundColor: theme.secondary }]}>
            <ThemedText style={styles.previewText}>Secondary</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.previewItem, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.previewText}>Accent</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.previewCard}>
          <ThemedText style={[styles.previewCardTitle, { color: theme.text }]}>
            Sample Card
          </ThemedText>
          <ThemedText style={[styles.previewCardText, { color: theme.textSecondary }]}>
            This is how your content will look with this theme
          </ThemedText>
          <TouchableOpacity 
            style={[styles.previewButton, { backgroundColor: theme.primary }]}
            disabled
          >
            <ThemedText style={styles.previewButtonText}>Sample Button</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Кнопка сброса */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: theme.error }]}
        onPress={() => {
          Alert.alert(
            'Reset Settings',
            'Reset all settings to default?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: async () => {
                  setCurrentTheme('purple');
                  setIsDark(false);
                  await AsyncStorage.multiRemove(['appTheme', 'darkMode']);
                  Alert.alert('Success', 'Settings reset to default');
                }
              }
            ]
          );
        }}
      >
        <Feather name="refresh-cw" size={16} color={theme.error} />
        <ThemedText style={[styles.resetButtonText, { color: theme.error }]}>
          Reset to Default
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ СТИЛИ
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleHandleActive: {
    transform: [{ translateX: 22 }],
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
  },
  // НОВЫЕ СТИЛИ
  previewRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  previewItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  previewCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  previewCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewCardText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});