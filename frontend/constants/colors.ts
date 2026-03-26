export const colors = {
  purple: {
    primary: '#4c4eaf',
    secondary: '#787bbc',
    accent: '#9d9ae5',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e9ecef',
    success: '#06D6A0',
    warning: '#FFD166',
    error: '#EF476F',
    gradient: ['#4c4eaf', '#787bbc', '#9d9ae5'],
  },
  
  purpleDark: {
    primary: '#9d9ae5',
    secondary: '#787bbc',
    accent: '#4c4eaf',
    background: '#1a1a2c',
    surface: '#2a2a3c',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#3a3a4c',
    success: '#06D6A0',
    warning: '#FFD166',
    error: '#EF476F',
    gradient: ['#4c4eaf', '#787bbc', '#9d9ae5'],
  },

  blue: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    background: '#f0f9ff',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: ['#2563eb', '#3b82f6', '#60a5fa'],
  },

  blueDark: {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    accent: '#2563eb',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: ['#2563eb', '#3b82f6', '#60a5fa'],
  },

  green: {
    primary: '#2d6a4f',
    secondary: '#40916c',
    accent: '#52b788',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#1e3a2b',
    textSecondary: '#4a6b5a',
    border: '#dcfce7',
    success: '#2d6a4f',
    warning: '#b45309',
    error: '#b91c1c',
    gradient: ['#2d6a4f', '#40916c', '#52b788'],
  },

  greenDark: {
    primary: '#52b788',
    secondary: '#40916c',
    accent: '#2d6a4f',
    background: '#081c15',
    surface: '#1b3a2b',
    text: '#ffffff',
    textSecondary: '#a7c4b5',
    border: '#2d5a3a',
    success: '#2d6a4f',
    warning: '#b45309',
    error: '#b91c1c',
    gradient: ['#2d6a4f', '#40916c', '#52b788'],
  },
};

export const getCurrentTheme = (themeName: string = 'purple', isDark: boolean = false) => {
  const key = isDark && themeName === 'purple' ? 'purpleDark' : 
              isDark && themeName === 'blue' ? 'blueDark' :
              isDark && themeName === 'green' ? 'greenDark' : 
              themeName;
  
  return colors[key] || colors.purple;
};