import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  disabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    if (isInputFocused && !event.ctrlKey && !event.altKey) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      if (shortcut.disabled) return false;

      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrl === event.ctrlKey &&
        !!shortcut.alt === event.altKey &&
        !!shortcut.shift === event.shiftKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: shortcuts.filter(s => !s.disabled)
  };
}

export function useMedicalNavigationShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      ctrl: true,
      action: () => router.push('/home'),
      description: 'Ir para Home'
    },
    {
      key: 'p',
      ctrl: true,
      action: () => router.push('/pacientes'),
      description: 'Ir para Pacientes'
    },
    {
      key: 'r',
      ctrl: true,
      action: () => router.push('/prescricoes'),
      description: 'Ir para Prescrições'
    },
    {
      key: 'n',
      ctrl: true,
      shift: true,
      action: () => router.push('/prescricoes/nova'),
      description: 'Nova Prescrição'
    },
    {
      key: 'c',
      ctrl: true,
      action: () => router.push('/configuracoes'),
      description: 'Ir para Configurações'
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="pesquisar" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: 'Focar na busca'
    },
    {
      key: 'Escape',
      action: () => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }

        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const closeButton = modal.querySelector('button[aria-label*="fechar" i], button[aria-label*="close" i]') as HTMLButtonElement;
          closeButton?.click();
        }
      },
      description: 'Fechar modal/desfocus'
    }
  ];

  return useKeyboardShortcuts({ shortcuts });
}

export function usePrescriptionFormShortcuts(
  onSave?: () => void,
  onCancel?: () => void,
  onAddMedication?: () => void
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      ctrl: true,
      action: () => onSave?.(),
      description: 'Salvar prescrição',
      disabled: !onSave
    },
    {
      key: 'Escape',
      action: () => onCancel?.(),
      description: 'Cancelar prescrição',
      disabled: !onCancel
    },
    {
      key: 'm',
      ctrl: true,
      action: () => onAddMedication?.(),
      description: 'Adicionar medicamento',
      disabled: !onAddMedication
    }
  ];

  return useKeyboardShortcuts({ shortcuts });
}

export function usePatientFormShortcuts(
  onSave?: () => void,
  onCancel?: () => void
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      ctrl: true,
      action: () => onSave?.(),
      description: 'Salvar paciente',
      disabled: !onSave
    },
    {
      key: 'Escape',
      action: () => onCancel?.(),
      description: 'Cancelar edição',
      disabled: !onCancel
    }
  ];

  return useKeyboardShortcuts({ shortcuts });
}