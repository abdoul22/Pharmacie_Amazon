import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useDarkMode from '@/hooks/useDarkMode';

/**
 * Bouton toggle dark mode simple et propre avec Switch shadcn/ui
 */
const DarkModeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <div className="flex items-center" title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}>
      {/* Switch shadcn/ui officiel - simple et propre */}
      <Switch
        id="dark-mode-toggle"
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
      />

      {/* Label invisible pour l'accessibilité */}
      <Label htmlFor="dark-mode-toggle" className="sr-only">
        {isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      </Label>
    </div>
  );
};

export default DarkModeToggle;
