'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'F1',
    action: () => window.location.href = '/pos',
    description: 'เปิดหน้า POS',
  },
  {
    key: 'F2',
    action: () => window.location.href = '/menu',
    description: 'จัดการเมนู',
  },
  {
    key: 'F3',
    action: () => window.location.href = '/inventory',
    description: 'จัดการคลังสินค้า',
  },
  {
    key: 'F4',
    action: () => window.location.href = '/reports',
    description: 'ดูรายงาน',
  },
  {
    key: 'F5',
    action: () => window.location.href = '/loyalty',
    description: 'สมาชิกและแต้ม',
  },
];

export function useKeyboardShortcuts(customShortcuts: KeyboardShortcut[] = []) {
  const shortcuts = [...DEFAULT_SHORTCUTS, ...customShortcuts];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          !!s.ctrlKey === event.ctrlKey &&
          !!s.shiftKey === event.shiftKey &&
          !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export function KeyboardShortcutsHelp() {
  const shortcuts = DEFAULT_SHORTCUTS;

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-50">
      <h3 className="font-semibold mb-2 text-[var(--coffee-dark)]">⌨️ Keyboard Shortcuts</h3>
      <div className="space-y-1 text-sm">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex justify-between gap-4">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
            <span className="text-gray-600">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
