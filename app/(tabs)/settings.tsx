import { ThemedText } from '@/components/themed-text';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Типы для цветовой схемы
type ColorScheme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  gradient: string[];
};

// Интерфейс для пользовательских цветов
type CustomColor = {
  id: string;
  name: string;
  value: string;
};

export default function SettingsScreen() {
  const [currentScheme, setCurrentScheme] = useState<string>('purple');
  const [useDarkMode, setUseDarkMode] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#787bbc');
  const [editingColor, setEditingColor] = useState<CustomColor | null>(null);

  // Предустановленные цветовые схемы
  const colorSchemes: ColorScheme[] = [
    {
      id: 'purple',
      name: 'Deep Purple',
      primary: '#4c4eaf',
      secondary: '#787bbc',
      accent: '#9d9ae5',
      background: useDarkMode ? '#1a1a2c' : '#f8f9fa',
      surface: useDarkMode ? '#2a2a3c' : '#ffffff',
      text: useDarkMode ? '#ffffff' : '#333333',
      textSecondary: useDarkMode ? '#b0b0b0' : '#666666',
      border: useDarkMode ? '#3a3a4c' : '#e9ecef',
      success: '#06D6A0',
      warning: '#FFD166',
      error: '#EF476F',
      gradient: ['#4c4eaf', '#787bbc', '#9d9ae5'],
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: useDarkMode ? '#0f172a' : '#f0f9ff',
      surface: useDarkMode ? '#1e293b' : '#ffffff',
      text: useDarkMode ? '#ffffff' : '#1e293b',
      textSecondary: useDarkMode ? '#94a3b8' : '#64748b',
      border: useDarkMode ? '#334155' : '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradient: ['#2563eb', '#3b82f6', '#60a5fa'],
    },
    {
      id: 'green',
      name: 'Forest Green',
      primary: '#2d6a4f',
      secondary: '#40916c',
      accent: '#52b788',
      background: useDarkMode ? '#081c15' : '#f0fdf4',
      surface: useDarkMode ? '#1b3a2b' : '#ffffff',
      text: useDarkMode ? '#ffffff' : '#1e3a2b',
      textSecondary: useDarkMode ? '#a7c4b5' : '#4a6b5a',
      border: useDarkMode ? '#2d5a3a' : '#dcfce7',
      success: '#2d6a4f',
      warning: '#b45309',
      error: '#b91c1c',
      gradient: ['#2d6a4f', '#40916c', '#52b788'],
    },
    {
      id: 'pink',
      name: 'Rose Pink',
      primary: '#b83280',
      secondary: '#d53f8c',
      accent: '#ed64a6',
      background: useDarkMode ? '#2a1a2a' : '#fff5f7',
      surface: useDarkMode ? '#3a2a3a' : '#ffffff',
      text: useDarkMode ? '#ffffff' : '#2a1a2a',
      textSecondary: useDarkMode ? '#d4b0c0' : '#7a4a6a',
      border: useDarkMode ? '#4a3a4a' : '#fed7e2',
      success: '#b83280',
      warning: '#c05640',
      error: '#c53030',
      gradient: ['#b83280', '#d53f8c', '#ed64a6'],
    },
    {
      id: 'orange',
      name: 'Sunset Orange',
      primary: '#c2410c',
      secondary: '#ea580c',
      accent: '#f97316',
      background: useDarkMode ? '#2a1a0a' : '#fff7ed',
      surface: useDarkMode ? '#3a2a1a' : '#ffffff',
      text: useDarkMode ? '#ffffff' : '#2a1a0a',
      textSecondary: useDarkMode ? '#d4b090' : '#7a5a3a',
      border: useDarkMode ? '#4a3a2a' : '#ffedd5',
      success: '#c2410c',
      warning: '#d97706',
      error: '#dc2626',
      gradient: ['#c2410c', '#ea580c', '#f97316'],
    },
    {
      id: 'gray',
      name: 'Minimal Gray',
      primary: '#4b5563',
      secondary: '#6b7280',
      accent: '#9ca3af',
      background: useDarkMode ? '#111827' : '#f9fafb',
      surface: useDarkMode ? '#1f2937' : '#ffffff',
      text: useDarkMode ? '#ffffff' : '#1f2937',
      textSecondary: useDarkMode ? '#9ca3af' : '#6b7280',
      border: useDarkMode ? '#374151' : '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradient: ['#4b5563', '#6b7280', '#9ca3af'],
    },
  ];

  // Загрузка сохраненных настроек
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedScheme = await AsyncStorage.getItem('colorScheme');
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedSystemTheme = await AsyncStorage.getItem('systemTheme');
      const savedCustomColors = await AsyncStorage.getItem('customColors');

      if (savedScheme) setCurrentScheme(savedScheme);
      if (savedDarkMode) setUseDarkMode(JSON.parse(savedDarkMode));
      if (savedSystemTheme) setUseSystemTheme(JSON.parse(savedSystemTheme));
      if (savedCustomColors) setCustomColors(JSON.parse(savedCustomColors));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSchemeChange = (schemeId: string) => {
    setCurrentScheme(schemeId);
    saveSettings('colorScheme', schemeId);
  };

  const handleDarkModeToggle = () => {
    const newValue = !useDarkMode;
    setUseDarkMode(newValue);
    saveSettings('darkMode', newValue);
  };

  const handleSystemThemeToggle = () => {
    const newValue = !useSystemTheme;
    setUseSystemTheme(newValue);
    saveSettings('systemTheme', newValue);
  };

  const getCurrentScheme = () => {
    return colorSchemes.find(s => s.id === currentScheme) || colorSchemes[0];
  };

  const handleAddCustomColor = () => {
    if (!newColorName.trim()) {
      Alert.alert('Error', 'Please enter a color name');
      return;
    }

    const newColor: CustomColor = {
      id: Date.now().toString(),
      name: newColorName,
      value: newColorValue,
    };

    const updatedColors = [...customColors, newColor];
    setCustomColors(updatedColors);
    saveSettings('customColors', updatedColors);
    
    setNewColorName('');
    setNewColorValue('#787bbc');
    setShowCustomPicker(false);
    
    Alert.alert('Success', 'Custom color added!');
  };

  const handleEditCustomColor = (color: CustomColor) => {
    setEditingColor(color);
    setNewColorName(color.name);
    setNewColorValue(color.value);
    setShowCustomPicker(true);
  };

  const handleUpdateCustomColor = () => {
    if (!editingColor) return;

    const updatedColors = customColors.map(color =>
      color.id === editingColor.id
        ? { ...color, name: newColorName, value: newColorValue }
        : color
    );

    setCustomColors(updatedColors);
    saveSettings('customColors', updatedColors);
    
    setEditingColor(null);
    setNewColorName('');
    setNewColorValue('#787bbc');
    setShowCustomPicker(false);
    
    Alert.alert('Success', 'Color updated!');
  };

  const handleDeleteCustomColor = (colorId: string) => {
    Alert.alert(
      'Delete Color',
      'Are you sure you want to delete this custom color?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedColors = customColors.filter(c => c.id !== colorId);
            setCustomColors(updatedColors);
            saveSettings('customColors', updatedColors);
          },
        },
      ]
    );
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all color settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setCurrentScheme('purple');
            setUseDarkMode(false);
            setUseSystemTheme(true);
            setCustomColors([]);
            
            await AsyncStorage.multiRemove([
              'colorScheme',
              'darkMode',
              'systemTheme',
              'customColors',
            ]);
            
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const scheme = getCurrentScheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: scheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок */}
      <LinearGradient
        colors={scheme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <ThemedText type="title" style={styles.headerTitle}>
          Settings
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Customize your app experience
        </ThemedText>
      </LinearGradient>

      {/* Тема */}
      <View style={[styles.section, { backgroundColor: scheme.surface }]}>
        <View style={styles.sectionHeader}>
          <Feather name="sun" size={20} color={scheme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: scheme.text }]}>
            Theme
          </ThemedText>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Feather name="monitor" size={18} color={scheme.textSecondary} />
            <ThemedText style={[styles.settingLabel, { color: scheme.text }]}>
              Use System Theme
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: scheme.border },
              useSystemTheme && { backgroundColor: scheme.primary }
            ]}
            onPress={handleSystemThemeToggle}
          >
            <View
              style={[
                styles.toggleHandle,
                useSystemTheme && styles.toggleHandleActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Feather name="moon" size={18} color={scheme.textSecondary} />
            <ThemedText style={[styles.settingLabel, { color: scheme.text }]}>
              Dark Mode
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: scheme.border },
              useDarkMode && !useSystemTheme && { backgroundColor: scheme.primary }
            ]}
            onPress={handleDarkModeToggle}
            disabled={useSystemTheme}
          >
            <View
              style={[
                styles.toggleHandle,
                useDarkMode && !useSystemTheme && styles.toggleHandleActive,
                useSystemTheme && styles.toggleHandleDisabled,
              ]}
            />
          </TouchableOpacity>
        </View>

        {useSystemTheme && (
          <View style={[styles.hint, { backgroundColor: `${scheme.primary}20` }]}>
            <Feather name="info" size={14} color={scheme.primary} />
            <ThemedText style={[styles.hintText, { color: scheme.textSecondary }]}>
              Dark Mode is controlled by your system settings
            </ThemedText>
          </View>
        )}
      </View>

      {/* Цветовые схемы */}
      <View style={[styles.section, { backgroundColor: scheme.surface }]}>
        <View style={styles.sectionHeader}>
          <Feather name="palette" size={20} color={scheme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: scheme.text }]}>
            Color Schemes
          </ThemedText>
        </View>

        <View style={styles.colorSchemes}>
          {colorSchemes.map((colorScheme) => (
            <TouchableOpacity
              key={colorScheme.id}
              style={[
                styles.colorSchemeCard,
                { backgroundColor: scheme.background },
                currentScheme === colorScheme.id && {
                  borderColor: colorScheme.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleSchemeChange(colorScheme.id)}
            >
              <LinearGradient
                colors={colorScheme.gradient}
                style={styles.colorSchemePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.colorSchemeInfo}>
                <ThemedText style={[styles.colorSchemeName, { color: scheme.text }]}>
                  {colorScheme.name}
                </ThemedText>
                <View style={styles.colorDots}>
                  {colorScheme.gradient.map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorDot, { backgroundColor: color }]}
                    />
                  ))}
                </View>
              </View>
              {currentScheme === colorScheme.id && (
                <View style={[styles.checkmark, { backgroundColor: colorScheme.primary }]}>
                  <Feather name="check" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Пользовательские цвета */}
      <View style={[styles.section, { backgroundColor: scheme.surface }]}>
        <View style={styles.sectionHeader}>
          <Feather name="plus-circle" size={20} color={scheme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: scheme.text }]}>
            Custom Colors
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.addColorButton, { borderColor: scheme.border }]}
          onPress={() => {
            setEditingColor(null);
            setNewColorName('');
            setNewColorValue(scheme.primary);
            setShowCustomPicker(true);
          }}
        >
          <Feather name="plus" size={20} color={scheme.primary} />
          <ThemedText style={[styles.addColorText, { color: scheme.primary }]}>
            Add Custom Color
          </ThemedText>
        </TouchableOpacity>

        {customColors.length > 0 && (
          <View style={styles.customColorsList}>
            {customColors.map((color) => (
              <View key={color.id} style={styles.customColorItem}>
                <View style={styles.customColorInfo}>
                  <View
                    style={[styles.customColorPreview, { backgroundColor: color.value }]}
                  />
                  <View>
                    <ThemedText style={[styles.customColorName, { color: scheme.text }]}>
                      {color.name}
                    </ThemedText>
                    <ThemedText style={[styles.customColorValue, { color: scheme.textSecondary }]}>
                      {color.value}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.customColorActions}>
                  <TouchableOpacity
                    style={styles.customColorAction}
                    onPress={() => handleEditCustomColor(color)}
                  >
                    <Feather name="edit-2" size={16} color={scheme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.customColorAction}
                    onPress={() => handleDeleteCustomColor(color.id)}
                  >
                    <Feather name="trash-2" size={16} color={scheme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Предпросмотр цветов */}
      <View style={[styles.section, { backgroundColor: scheme.surface }]}>
        <View style={styles.sectionHeader}>
          <Feather name="eye" size={20} color={scheme.primary} />
          <ThemedText style={[styles.sectionTitle, { color: scheme.text }]}>
            Preview
          </ThemedText>
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.previewRow}>
            <View style={[styles.previewItem, { backgroundColor: scheme.primary }]}>
              <ThemedText style={styles.previewText}>Primary</ThemedText>
            </View>
            <View style={[styles.previewItem, { backgroundColor: scheme.secondary }]}>
              <ThemedText style={styles.previewText}>Secondary</ThemedText>
            </View>
            <View style={[styles.previewItem, { backgroundColor: scheme.accent }]}>
              <ThemedText style={styles.previewText}>Accent</ThemedText>
            </View>
          </View>

          <View style={styles.previewRow}>
            <View style={[styles.previewItem, { backgroundColor: scheme.success }]}>
              <ThemedText style={styles.previewText}>Success</ThemedText>
            </View>
            <View style={[styles.previewItem, { backgroundColor: scheme.warning }]}>
              <ThemedText style={styles.previewText}>Warning</ThemedText>
            </View>
            <View style={[styles.previewItem, { backgroundColor: scheme.error }]}>
              <ThemedText style={styles.previewText}>Error</ThemedText>
            </View>
          </View>

          <View style={[styles.previewCard, { backgroundColor: scheme.background, borderColor: scheme.border }]}>
            <ThemedText style={[styles.previewCardTitle, { color: scheme.text }]}>
              Sample Card
            </ThemedText>
            <ThemedText style={[styles.previewCardText, { color: scheme.textSecondary }]}>
              This is how your content will look with the selected color scheme.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.previewButton, { backgroundColor: scheme.primary }]}
              disabled
            >
              <ThemedText style={styles.previewButtonText}>Button</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Кнопка сброса */}
      <TouchableOpacity
        style={[styles.resetButton, { borderColor: scheme.error }]}
        onPress={resetToDefault}
      >
        <Feather name="refresh-cw" size={16} color={scheme.error} />
        <ThemedText style={[styles.resetButtonText, { color: scheme.error }]}>
          Reset to Default
        </ThemedText>
      </TouchableOpacity>

      {/* Модальное окно для добавления/редактирования цвета */}
      <Modal
        visible={showCustomPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCustomPicker(false);
          setEditingColor(null);
          setNewColorName('');
          setNewColorValue(scheme.primary);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: scheme.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: scheme.text }]}>
                {editingColor ? 'Edit Color' : 'Add Custom Color'}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomPicker(false);
                  setEditingColor(null);
                  setNewColorName('');
                  setNewColorValue(scheme.primary);
                }}
              >
                <Ionicons name="close" size={24} color={scheme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalField}>
                <ThemedText style={[styles.modalLabel, { color: scheme.text }]}>
                  Color Name
                </ThemedText>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: scheme.background,
                      color: scheme.text,
                      borderColor: scheme.border,
                    },
                  ]}
                  placeholder="e.g., Sunset Purple"
                  placeholderTextColor={scheme.textSecondary}
                  value={newColorName}
                  onChangeText={setNewColorName}
                />
              </View>

              <View style={styles.modalField}>
                <ThemedText style={[styles.modalLabel, { color: scheme.text }]}>
                  Color Value
                </ThemedText>
                <View style={styles.colorPickerRow}>
                  <TextInput
                    style={[
                      styles.modalInput,
                      styles.colorValueInput,
                      {
                        backgroundColor: scheme.background,
                        color: scheme.text,
                        borderColor: scheme.border,
                      },
                    ]}
                    placeholder="#787bbc"
                    placeholderTextColor={scheme.textSecondary}
                    value={newColorValue}
                    onChangeText={setNewColorValue}
                  />
                  <View
                    style={[
                      styles.colorPreviewLarge,
                      { backgroundColor: newColorValue },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.presetColors}>
                <ThemedText style={[styles.presetColorsTitle, { color: scheme.textSecondary }]}>
                  Preset Colors
                </ThemedText>
                <View style={styles.presetColorsGrid}>
                  {['#787bbc', '#4c4eaf', '#9d9ae5', '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.presetColor,
                        { backgroundColor: color },
                        newColorValue === color && styles.presetColorActive,
                      ]}
                      onPress={() => setNewColorValue(color)}
                    >
                      {newColorValue === color && (
                        <Feather name="check" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCustomPicker(false);
                  setEditingColor(null);
                  setNewColorName('');
                  setNewColorValue(scheme.primary);
                }}
              >
                <ThemedText style={[styles.modalButtonText, { color: scheme.textSecondary }]}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalSaveButton,
                  { backgroundColor: scheme.primary },
                ]}
                onPress={editingColor ? handleUpdateCustomColor : handleAddCustomColor}
              >
                <ThemedText style={styles.modalSaveButtonText}>
                  {editingColor ? 'Update' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
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
  toggleHandleDisabled: {
    opacity: 0.5,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    flex: 1,
  },
  colorSchemes: {
    gap: 12,
  },
  colorSchemeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorSchemePreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  colorSchemeInfo: {
    flex: 1,
  },
  colorSchemeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  colorDots: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addColorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addColorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  customColorsList: {
    marginTop: 16,
    gap: 12,
  },
  customColorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  customColorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  customColorName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  customColorValue: {
    fontSize: 12,
  },
  customColorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  customColorAction: {
    padding: 8,
  },
  previewContainer: {
    gap: 16,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
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
  },
  modalBody: {
    gap: 20,
  },
  modalField: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  colorPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorValueInput: {
    flex: 1,
  },
  colorPreviewLarge: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  presetColors: {
    marginTop: 8,
    gap: 12,
  },
  presetColorsTitle: {
    fontSize: 14,
  },
  presetColorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetColorActive: {
    borderWidth: 3,
    borderColor: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
  },
  modalSaveButton: {
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});