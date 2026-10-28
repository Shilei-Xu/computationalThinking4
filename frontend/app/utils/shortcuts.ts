export type Command = 'copy' | 'cut' | 'paste' | 'duplicate' | 'delete' | 'deselect' | 'left' | 'right' | 'up' | 'down'

// `mod` means ⌘ on macOS and Ctrl elsewhere.
export const SHORTCUTS: { key: string, mod?: boolean, label: string, command: Command }[] = [
  { key: 'c', mod: true, label: '⌘C', command: 'copy' },
  { key: 'x', mod: true, label: '⌘X', command: 'cut' },
  { key: 'v', mod: true, label: '⌘V', command: 'paste' },
  { key: 'd', mod: true, label: '⌘D', command: 'duplicate' },
  { key: 'Backspace', label: '⌫', command: 'delete' },
  { key: 'Delete', label: 'Entf', command: 'delete' },
  { key: 'Escape', label: 'Esc', command: 'deselect' },
  { key: 'ArrowLeft', label: '←', command: 'left' },
  { key: 'ArrowRight', label: '→', command: 'right' },
  { key: 'ArrowUp', label: '↑', command: 'up' },
  { key: 'ArrowDown', label: '↓', command: 'down' },
]

export function findCommand(event: KeyboardEvent): Command | undefined {
  const mod = event.metaKey || event.ctrlKey
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  return SHORTCUTS.find(s => s.key === key && !!s.mod === mod)?.command
}
