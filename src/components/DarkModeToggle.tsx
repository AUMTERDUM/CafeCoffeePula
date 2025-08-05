'use client';

import { useDarkMode } from '@/contexts/DarkModeContext';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-modern transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20"
      style={{
        backgroundColor: isDarkMode ? '#3E3E3E' : '#FFFFFF',
        border: '2px solid',
        borderColor: isDarkMode ? '#8B6B5C' : '#BDAA9F',
        color: isDarkMode ? '#D9CAB3' : '#8B6B5C',
      }}
      title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300" />
      )}
    </button>
  );
}
