import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

// Типы для целей
type Goal = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number; // в минутах или сессиях
  current: number;
  unit: 'minutes' | 'sessions';
  deadline?: string;
  color: string;
  createdAt: string;
  completed: boolean;
};

type GoalTemplate = {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: 'minutes' | 'sessions';
  icon: string;
};

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Форма новой цели
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [target, setTarget] = useState('60');
  const [unit, setUnit] = useState<'minutes' | 'sessions'>('minutes');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4c4eaf');

  // Предустановленные шаблоны целей
  const goalTemplates: GoalTemplate[] = [
    { id: '1', title: 'Daily Focus', description: 'Focus for at least 60 minutes every day', target: 60, unit: 'minutes', icon: 'sun' },
    { id: '2', title: 'Deep Work', description: 'Complete 4 deep work sessions this week', target: 4, unit: 'sessions', icon: 'target' },
    { id: '3', title: 'Weekly Marathon', description: 'Accumulate 10 hours of focused work', target: 600, unit: 'minutes', icon: 'award' },
    { id: '4', title: 'Morning Routine', description: 'Start each day with 30 minutes of focused work', target: 30, unit: 'minutes', icon: 'sunrise' },
    { id: '5', title: 'Consistency Streak', description: 'Maintain a 7-day focus streak', target: 7, unit: 'sessions', icon: 'flame' },
    { id: '6', title: 'Project Completion', description: 'Spend 20 hours on your main project', target: 1200, unit: 'minutes', icon: 'check-circle' },
  ];

  // Цвета для целей
  const colorOptions = ['#4c4eaf', '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'];

  // Загрузка целей при монтировании
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        // Примерные цели по умолчанию
        const defaultGoals: Goal[] = [
          {
            id: '1',
            title: 'Daily Focus Goal',
            description: 'Focus for at least 60 minutes every day',
            type: 'daily',
            target: 60,
            current: 45,
            unit: 'minutes',
            color: '#4c4eaf',
            createdAt: new Date().toISOString(),
            completed: false,
          },
          {
            id: '2',
            title: 'Weekly Deep Work',
            description: 'Complete 5 deep work sessions this week',
            type: 'weekly',
            target: 5,
            current: 3,
            unit: 'sessions',
            color: '#4ECDC4',
            createdAt: new Date().toISOString(),
            completed: false,
          },
        ];
        setGoals(defaultGoals);
        await AsyncStorage.setItem('goals', JSON.stringify(defaultGoals));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const handleAddGoal = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      description,
      type: goalType,
      target: parseInt(target) || 60,
      current: 0,
      unit,
      deadline: deadline || undefined,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
    
    // Сброс формы
    setTitle('');
    setDescription('');
    setTarget('60');
    setGoalType('daily');
    setUnit('minutes');
    setDeadline('');
    setSelectedColor('#4c4eaf');
    setShowNewGoal(false);
    
    Alert.alert('Success!', 'New goal added 🎯');
  };

  const handleUpdateProgress = (goalId: string, amount: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newCurrent = Math.min(goal.current + amount, goal.target);
        const completed = newCurrent >= goal.target;
        
        if (completed && !goal.completed) {
          setTimeout(() => {
            Alert.alert('🎉 Goal Completed!', `You've reached your goal: ${goal.title}`);
          }, 300);
        }
        
        return {
          ...goal,
          current: newCurrent,
          completed,
        };
      }
      return goal;
    });
    
    saveGoals(updatedGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedGoals = goals.filter(goal => goal.id !== goalId);
            saveGoals(updatedGoals);
          },
        },
      ]
    );
  };

  const handleUseTemplate = (template: GoalTemplate) => {
    setTitle(template.title);
    setDescription(template.description);
    setTarget(template.target.toString());
    setUnit(template.unit);
    setShowTemplates(false);
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getGoalStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0) / totalGoals * 100 || 0;
    
    return { totalGoals, completedGoals, totalProgress: Math.round(totalProgress) };
  };

  const stats = getGoalStats();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Заголовок */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Goals 🎯</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Set targets, track progress, achieve more</ThemedText>
      </ThemedView>

      {/* Статистика */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <Feather name="target" size={24} color="#4c4eaf" />
          <ThemedText style={styles.statNumber}>{stats.totalGoals}</ThemedText>
          <ThemedText style={styles.statLabel}>Active Goals</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statCard}>
          <Feather name="check-circle" size={24} color="#4ECDC4" />
          <ThemedText style={styles.statNumber}>{stats.completedGoals}</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statCard}>
          <Feather name="trending-up" size={24} color="#FF6B6B" />
          <ThemedText style={styles.statNumber}>{stats.totalProgress}%</ThemedText>
          <ThemedText style={styles.statLabel}>Overall Progress</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Кнопки действий */}
      <ThemedView style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowNewGoal(true)}>
          <Ionicons name="add-circle" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>New Goal</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.templateButton]}
          onPress={() => setShowTemplates(true)}>
          <Feather name="layers" size={20} color="#4c4eaf" />
          <ThemedText style={[styles.actionButtonText, styles.templateButtonText]}>Templates</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Список целей */}
      <ThemedView style={styles.goalsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Your Goals</ThemedText>
        
        {goals.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Feather name="target" size={60} color="#ddd" />
            <ThemedText style={styles.emptyStateTitle}>No goals yet</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              Set your first goal to start tracking your progress
            </ThemedText>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowNewGoal(true)}>
              <ThemedText style={styles.emptyStateButtonText}>Create First Goal</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          goals.map((goal) => (
            <ThemedView key={goal.id} style={styles.goalCard}>
              <ThemedView style={[styles.goalColorTag, { backgroundColor: goal.color }]} />
              
              <ThemedView style={styles.goalContent}>
                <ThemedView style={styles.goalHeader}>
                  <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                  <ThemedView style={styles.goalTypeBadge}>
                    <ThemedText style={styles.goalTypeText}>{goal.type}</ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
                
                <ThemedView style={styles.goalProgress}>
                  <ThemedView style={styles.progressBar}>
                    <ThemedView 
                      style={[
                        styles.progressFill, 
                        { width: `${calculateProgress(goal)}%`, backgroundColor: goal.color }
                      ]} 
                    />
                  </ThemedView>
                  
                  <ThemedText style={styles.progressText}>
                    {goal.current} / {goal.target} {goal.unit}
                    <ThemedText style={styles.progressPercent}>
                      {' '}({Math.round(calculateProgress(goal))}%)
                    </ThemedText>
                  </ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.goalActions}>
                  <TouchableOpacity 
                    style={styles.progressButton}
                    onPress={() => handleUpdateProgress(goal.id, goal.unit === 'minutes' ? 15 : 1)}>
                    <Feather name="plus" size={16} color={goal.color} />
                    <ThemedText style={[styles.progressButtonText, { color: goal.color }]}>
                      Add {goal.unit === 'minutes' ? '15min' : '1 session'}
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteGoal(goal.id)}>
                    <Feather name="trash-2" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </ThemedView>
                
                {goal.completed && (
                  <ThemedView style={styles.completedBadge}>
                    <Feather name="check-circle" size={16} color="#06D6A0" />
                    <ThemedText style={styles.completedText}>Completed! 🎉</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          ))
        )}
      </ThemedView>

      {/* Модальное окно: Новая цель */}
      <Modal
        visible={showNewGoal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewGoal(false)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedView style={styles.modalHeader}>
                <ThemedText type="title" style={styles.modalTitle}>New Goal 🎯</ThemedText>
                <TouchableOpacity onPress={() => setShowNewGoal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </ThemedView>

              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Goal Title</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="What do you want to achieve?"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#999"
                />
              </ThemedView>

              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Description (Optional)</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add more details about your goal..."
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </ThemedView>

              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Goal Type</ThemedText>
                <ThemedView style={styles.typeOptions}>
                  {(['daily', 'weekly', 'monthly', 'custom'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        goalType === type && styles.typeOptionActive,
                      ]}
                      onPress={() => setGoalType(type)}>
                      <ThemedText style={[
                        styles.typeOptionText,
                        goalType === type && styles.typeOptionTextActive,
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Target</ThemedText>
                <ThemedView style={styles.targetRow}>
                  <TextInput
                    style={[styles.input, styles.targetInput]}
                    placeholder="60"
                    value={target}
                    onChangeText={setTarget}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <ThemedView style={styles.unitOptions}>
                    {(['minutes', 'sessions'] as const).map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.unitOption,
                          unit === u && styles.unitOptionActive,
                        ]}
                        onPress={() => setUnit(u)}>
                        <ThemedText style={[
                          styles.unitOptionText,
                          unit === u && styles.unitOptionTextActive,
                        ]}>
                          {u}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Color</ThemedText>
                <ThemedView style={styles.colorOptions}>
                  {colorOptions.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setSelectedColor(color)}>
                      {selectedColor === color && (
                        <Feather name="check" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              </ThemedView>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddGoal}>
                <ThemedText style={styles.submitButtonText}>Create Goal</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Модальное окно: Шаблоны */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplates(false)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>Goal Templates</ThemedText>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </ThemedView>

            <ThemedText style={styles.templatesSubtitle}>
              Choose from popular goal templates
            </ThemedText>

            <FlatList
              data={goalTemplates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.templateCard}
                  onPress={() => handleUseTemplate(item)}>
                  <ThemedView style={styles.templateIcon}>
                    <Feather name={item.icon as any} size={24} color="#4c4eaf" />
                  </ThemedView>
                  <ThemedView style={styles.templateContent}>
                    <ThemedText style={styles.templateTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.templateDescription}>{item.description}</ThemedText>
                    <ThemedText style={styles.templateTarget}>
                      Target: {item.target} {item.unit}
                    </ThemedText>
                  </ThemedView>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </ThemedView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c4eaf',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#4c4eaf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  templateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4c4eaf',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  templateButtonText: {
    color: '#4c4eaf',
  },
  goalsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
  },
  goalColorTag: {
    width: 8,
  },
  goalContent: {
    flex: 1,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  goalTypeBadge: {
    backgroundColor: '#f0f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalTypeText: {
    fontSize: 12,
    color: '#4c4eaf',
    fontWeight: '500',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  goalProgress: {
    marginBottom: 16,
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
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressPercent: {
    color: '#666',
    fontWeight: 'normal',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    color: '#06D6A0',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  templatesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeOptionActive: {
    backgroundColor: '#4c4eaf',
    borderColor: '#4c4eaf',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: 'white',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetInput: {
    flex: 1,
  },
  unitOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  unitOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  unitOptionActive: {
    backgroundColor: '#4c4eaf',
    borderColor: '#4c4eaf',
  },
  unitOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  unitOptionTextActive: {
    color: 'white',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#4c4eaf',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#4c4eaf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateTarget: {
    fontSize: 12,
    color: '#4c4eaf',
    fontWeight: '500',
  },
});