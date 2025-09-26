import { useState, useEffect } from 'react';

type DarkModeTheme = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
  theme: DarkModeTheme;
  isDark: boolean;
  setTheme: (theme: DarkModeTheme) => void;
  toggleTheme: () => void;
}

export const useDarkMode = (): UseDarkModeReturn => {
  // Récupérer la préférence sauvegardée ou utiliser 'system' par défaut
  const [theme, setTheme] = useState<DarkModeTheme>(() => {
    const savedTheme = localStorage.getItem('theme') as DarkModeTheme;
    return savedTheme || 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  // Fonction pour déterminer si le mode sombre doit être activé
  const calculateIsDark = (currentTheme: DarkModeTheme): boolean => {
    if (currentTheme === 'dark') return true;
    if (currentTheme === 'light') return false;
    // Mode system : utiliser la préférence du navigateur
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Appliquer le thème au DOM
  const applyTheme = (currentTheme: DarkModeTheme) => {
    const isDarkMode = calculateIsDark(currentTheme);
    setIsDark(isDarkMode);

    // Appliquer ou retirer la classe 'dark' sur l'élément html
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // Sauvegarder la préférence
    localStorage.setItem('theme', currentTheme);
  };

  // Changer de thème
  const changeTheme = (newTheme: DarkModeTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Toggle entre light et dark (ignore system)
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    // Appliquer le thème initial
    applyTheme(theme);

    // Écouter les changements de préférence système
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  return {
    theme,
    isDark,
    setTheme: changeTheme,
    toggleTheme,
  };
};

export default useDarkMode;
