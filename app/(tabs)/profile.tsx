import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  // Данные профиля (можно заменить на реальные данные)
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joinDate: 'March 2024',
    level: 'Pro',
    streak: 14,
    totalFocusTime: 12560, // в секундах
    completedSessions: 42,
    avgFocusTime: 45, // в минутах
  };

  // Функция для форматирования времени
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#787bbcff', dark: '#40415aff' }}
      headerImage={
        <Ionicons name="person-circle" size={100} color="white" style={styles.headerImage} />
      }>
      
      {/* Заголовок профиля */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.profileTitle}>Profile</ThemedText>
      </ThemedView>

      {/* Карточка профиля */}
      <ThemedView style={styles.profileCard}>
        <ThemedView style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <ThemedView style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>{userData.level}</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedText type="title" style={styles.userName}>{userData.name}</ThemedText>
        <ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
        
        <ThemedView style={styles.statsRow}>
          <ThemedView style={styles.statItem}>
            <Feather name="activity" size={20} color="#787bbc" />
            <ThemedText style={styles.statNumber}>{userData.streak}</ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.divider} />
          
          <ThemedView style={styles.statItem}>
            <MaterialIcons name="timer" size={20} color="#787bbc" />
            <ThemedText style={styles.statNumber}>{userData.completedSessions}</ThemedText>
            <ThemedText style={styles.statLabel}>Sessions</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.divider} />
          
          <ThemedView style={styles.statItem}>
            <FontAwesome name="calendar" size={20} color="#787bbc" />
            <ThemedText style={styles.statNumber}>{userData.joinDate}</ThemedText>
            <ThemedText style={styles.statLabel}>Joined</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Статистика фокуса */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Focus Statistics</ThemedText>
        
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statCard}>
            <MaterialIcons name="access-time" size={24} color="#4c4eaf" />
            <ThemedText style={styles.statValue}>{formatTime(userData.totalFocusTime)}</ThemedText>
            <ThemedText style={styles.statDescription}>Total Focus Time</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#4c4eaf" />
            <ThemedText style={styles.statValue}>{userData.avgFocusTime} min</ThemedText>
            <ThemedText style={styles.statDescription}>Average Session</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Достижения */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Achievements</ThemedText>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
          {['Early Bird', 'Focus Master', 'Consistency King', 'Weekend Warrior', 'Night Owl'].map((achievement, index) => (
            <ThemedView key={index} style={styles.achievementCard}>
              <ThemedView style={styles.achievementIcon}>
                <Feather name="award" size={24} color="#FFD700" />
              </ThemedView>
              <ThemedText style={styles.achievementText}>{achievement}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Настройки */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Settings</ThemedText>
        
        <ThemedView style={styles.settingsList}>
          {[
            { icon: 'notifications', label: 'Notifications', color: '#FF6B6B' },
            { icon: 'moon', label: 'Dark Mode', color: '#4ECDC4' },
            { icon: 'language', label: 'Language', color: '#45B7D1' },
            { icon: 'lock', label: 'Privacy', color: '#96CEB4' },
            { icon: 'help-circle', label: 'Help & Support', color: '#FECA57' },
          ].map((item, index) => (
            <ThemedView key={index} style={styles.settingItem}>
              <ThemedView style={[styles.settingIcon, { backgroundColor: item.color + '20' }]}>
                <Feather name={item.icon} size={20} color={item.color} />
              </ThemedView>
              <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
              <Feather name="chevron-right" size={20} color="#999" />
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#787bbc',
  },
  headerImage: {
    position: 'absolute',
    top: 10,
    right: 30,
    opacity: 0.8,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#787bbc',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#787bbc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  achievementsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  settingsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});