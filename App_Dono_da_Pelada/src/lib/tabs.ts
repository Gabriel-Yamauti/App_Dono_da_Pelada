/**
 * Configuração declarativa das 4 abas (CLAUDE.md §1).
 * Centralizada para que o layout de navegação seja data-driven e fácil de testar.
 * `icon` usa nomes outline do Ionicons (CLAUDE.md §2: ícones outline).
 */

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type TabConfig = {
  /** nome da rota em app/(tabs)/ — "index" é a aba inicial (Jogos) */
  name: string;
  /** chave do mock e da tela */
  key: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

export const TABS: TabConfig[] = [
  { name: 'index', key: 'jogos', label: 'Jogos', icon: 'football-outline' },
  { name: 'coletivo', key: 'coletivo', label: 'Coletivo', icon: 'people-outline' },
  { name: 'reservas', key: 'reservas', label: 'Reservas', icon: 'calendar-outline' },
  { name: 'perfil', key: 'perfil', label: 'Perfil', icon: 'person-outline' },
];
