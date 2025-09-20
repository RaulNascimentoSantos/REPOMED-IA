import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Keyboard, X, Command } from 'lucide-react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
}

interface ShortcutHelpProps {
  shortcuts: Shortcut[];
  className?: string;
}

export const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ shortcuts, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatShortcut = (shortcut: Shortcut) => {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
    return parts.join(' + ');
  };

  if (shortcuts.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-40',
          'p-3 bg-slate-800 hover:bg-slate-700',
          'border border-slate-600 rounded-full',
          'text-slate-300 hover:text-white',
          'transition-all duration-200',
          'shadow-lg hover:shadow-xl',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        title="Ver atalhos do teclado (Ctrl + ?)"
        aria-label="Abrir ajuda de atalhos"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className={cn(
              'relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl',
              'max-w-md w-full mx-4 p-6',
              'border border-slate-200 dark:border-slate-700',
              'animate-in fade-in-0 zoom-in-95 duration-200'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="shortcuts-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"
              >
                <Command className="w-5 h-5 text-blue-500" />
                Atalhos do Teclado
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  'p-1 rounded-lg',
                  'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                  'hover:bg-slate-100 dark:hover:bg-slate-700',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Fechar ajuda"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                    {shortcut.description}
                  </span>
                  <kbd
                    className={cn(
                      'px-2 py-1 ml-3 text-xs font-mono',
                      'bg-slate-100 dark:bg-slate-700',
                      'border border-slate-300 dark:border-slate-600',
                      'rounded text-slate-700 dark:text-slate-300',
                      'whitespace-nowrap'
                    )}
                  >
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Pressione <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Esc</kbd> para fechar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShortcutHelp;