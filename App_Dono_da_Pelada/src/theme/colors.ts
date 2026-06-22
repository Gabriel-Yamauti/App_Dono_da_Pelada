/**
 * Paleta de cores — "Dono da Pelada".
 *
 * Identidade visual (CLAUDE.md §2): fundo VERDE-ESCURO + destaque/CTA VERDE-LIMÃO,
 * cards escuros, acentos claros, ícones outline.
 *
 * Mantemos uma paleta DEDICADA para o tema escuro (CH-05): nada de "auto dark"
 * desarmônico. Todos os tokens abaixo são tratados como o tema padrão do app.
 */

export const palette = {
  // Verdes-escuros / Cinzas-escuros — fundo e superfícies (do mais escuro ao mais claro)
  greenBackground: '#131313', // fundo raiz da aplicação
  greenSurface: '#1c1b1b', // cards / containers
  greenSurfaceAlt: '#2a2a2a', // cards elevados / cabeçalhos / botões secundários
  greenBorder: '#2e2e2e', // bordas e divisores sutis

  // Verde-limão — destaque / CTA
  lime: '#c3f400',
  limePressed: '#aed800', // estado pressionado / hover
  limeMuted: '#7ba100', // limão dessaturado p/ estados desabilitados

  // Verde "CTA secundário" — botões verdes do protótipo (CONFIRMAR PRESENÇA,
  // INSCREVER, VER PLANTEL, Reservar…).
  greenCta: '#00452e',
  greenCtaPressed: '#003322',
  greenCtaDeep: '#002216',
  textOnGreen: '#76b394', // texto escuro/verde claro sobre botões verdes (alto contraste)

  // Superfície quase-preta para faixas/chips internos e placeholders de foto.
  surfaceDark: '#0e1a14',
  photoOverlay: 'rgba(0, 0, 0, 0.45)', // véu sobre placeholders de foto

  // Texto e acentos claros
  textPrimary: '#e5e2e1',
  textSecondary: '#c1c8c2',
  textOnLime: '#131313', // texto sobre botões verde-limão (alto contraste)

  // Estados semânticos
  success: '#3DDC84',
  warning: '#FFC53D',
  danger: '#FF5C5C',

  // Neutros utilitários
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)', // fundo de modais (CH-03)
} as const;

export type Palette = typeof palette;

