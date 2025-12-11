// Keyboard Shortcuts Hook
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: string;
}

export const shortcuts: Shortcut[] = [
  { key: '1', description: 'Go to 3D Overview', action: 'navigate:/' },
  { key: '2', description: 'Go to Incident Monitor', action: 'navigate:/explosion' },
  { key: '3', description: 'Go to Parking Status', action: 'navigate:/parking' },
  { key: '4', description: 'Go to Zone Inspection', action: 'navigate:/zones' },
  { key: '5', description: 'Go to Personnel Movement', action: 'navigate:/personnel' },
  { key: '6', description: 'Go to Thermal Comfort', action: 'navigate:/thermal' },
  { key: '7', description: 'Go to Analytics', action: 'navigate:/analytics' },
  { key: '8', description: 'Go to CCTV', action: 'navigate:/cctv' },
  { key: 'e', ctrl: true, description: 'Toggle Emergency Mode', action: 'emergency:toggle' },
  { key: 'v', ctrl: true, description: 'Toggle Voice Commands', action: 'voice:toggle' },
  { key: 'f', ctrl: true, description: 'Focus Search', action: 'focus:search' },
  { key: 'Escape', description: 'Close Panel / Cancel', action: 'close' },
  { key: '/', description: 'Show Keyboard Shortcuts', action: 'shortcuts:show' },
  { key: 'z', description: 'Toggle Zone Visibility', action: 'toggle:zones' },
  { key: 'p', description: 'Toggle Parking Visibility', action: 'toggle:parking' },
  { key: 'c', description: 'Toggle Camera Overlay', action: 'toggle:cameras' },
  { key: ' ', description: 'Play/Pause Simulation', action: 'simulation:toggle' },
  { key: 'ArrowLeft', description: 'Step Time Back', action: 'time:back' },
  { key: 'ArrowRight', description: 'Step Time Forward', action: 'time:forward' },
  { key: 'r', description: 'Reset View', action: 'view:reset' },
  { key: 'd', ctrl: true, description: 'Toggle Dark Mode', action: 'theme:toggle' },
];

type ActionHandler = (action: string, event: KeyboardEvent) => void;

export const useKeyboardShortcuts = (customHandlers?: Record<string, ActionHandler>) => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).isContentEditable
    ) {
      // Allow Escape to work even in inputs
      if (event.key !== 'Escape') return;
    }

    // Find matching shortcut
    const shortcut = shortcuts.find(s => {
      if (s.key.toLowerCase() !== event.key.toLowerCase()) return false;
      if (s.ctrl && !event.ctrlKey && !event.metaKey) return false;
      if (s.shift && !event.shiftKey) return false;
      if (s.alt && !event.altKey) return false;
      if (!s.ctrl && (event.ctrlKey || event.metaKey) && s.key !== 'Escape') return false;
      return true;
    });

    if (!shortcut) return;

    // Handle navigation shortcuts
    if (shortcut.action.startsWith('navigate:')) {
      event.preventDefault();
      const path = shortcut.action.replace('navigate:', '');
      navigate(path);
      return;
    }

    // Handle custom handlers
    if (customHandlers) {
      const handlerKey = shortcut.action.split(':')[0];
      const handler = customHandlers[shortcut.action] || customHandlers[handlerKey];
      if (handler) {
        event.preventDefault();
        handler(shortcut.action, event);
        return;
      }
    }

    // Default actions
    switch (shortcut.action) {
      case 'focus:search':
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        break;
      case 'shortcuts:show':
        event.preventDefault();
        // Dispatch custom event for shortcuts modal
        window.dispatchEvent(new CustomEvent('show-shortcuts'));
        break;
    }
  }, [navigate, customHandlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Shortcut display component helpers
export const formatShortcut = (shortcut: Shortcut): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Cmd');
  
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  if (key === 'ArrowLeft') key = '←';
  if (key === 'ArrowRight') key = '→';
  if (key === 'ArrowUp') key = '↑';
  if (key === 'ArrowDown') key = '↓';
  if (key === 'Escape') key = 'Esc';
  
  parts.push(key.toUpperCase());
  return parts.join(' + ');
};

export const getShortcutsByCategory = () => {
  return {
    navigation: shortcuts.filter(s => s.action.startsWith('navigate:')),
    view: shortcuts.filter(s => s.action.startsWith('toggle:') || s.action.startsWith('view:')),
    simulation: shortcuts.filter(s => s.action.startsWith('simulation:') || s.action.startsWith('time:')),
    system: shortcuts.filter(s => 
      s.action.startsWith('emergency:') || 
      s.action.startsWith('voice:') || 
      s.action.startsWith('theme:') ||
      s.action === 'shortcuts:show' ||
      s.action === 'focus:search' ||
      s.action === 'close'
    ),
  };
};

