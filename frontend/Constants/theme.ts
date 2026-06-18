// ─────────────────────────────────────────
// MemoLife 2.0 — Design System
// Palette exclusive — sobre, moderne, tout âge
// ─────────────────────────────────────────

export const Colors = {
  // ── Identité MemoLife ──────────────────
  primary:       '#1A1A2E',   // Bleu nuit — confiance, sérieux
  primaryLight:  '#16213E',   // Bleu nuit moyen
  accent:        '#4ECDC4',   // Turquoise — modernité, fraîcheur
  accentLight:   '#4ECDC415', // Turquoise transparent
  warm:          '#FF6B6B',   // Corail — alertes, énergie
  warmLight:     '#FF6B6B15',
  success:       '#6BCB77',   // Vert menthe — validations
  successLight:  '#6BCB7715',
  warning:       '#FFD93D',   // Jaune doux — attention
  warningLight:  '#FFD93D20',
  purple:        '#7B68EE',   // Violet — IA, intelligence
  purpleLight:   '#7B68EE15',

  // ── Neutres ───────────────────────────
  background:    '#F7F9FC',   // Fond principal — blanc bleuté
  surface:       '#FFFFFF',   // Cartes, modales
  surfaceAlt:    '#F0F4F8',   // Fond secondaire
  border:        '#E8EDF2',   // Bordures légères
  borderMed:     '#D1D9E0',   // Bordures moyennes

  // ── Texte ─────────────────────────────
  text:          '#1A1A2E',   // Texte principal
  textSec:       '#5A6577',   // Texte secondaire
  textTer:       '#9BA8B5',   // Texte désactivé
  textInv:       '#FFFFFF',   // Texte sur fond sombre
  textPrimary:   '#1A1A2E',   // alias texte principal
  textSecondary: '#5A6577',   // alias texte secondaire
  textTertiary:  '#9BA8B5',   // alias texte tertiaire
  danger:        '#FF6B6B',   // alias d'alerte
  secondary:     '#4ECDC4',   // alias secondaire

  // ── Gradients (valeurs pour LinearGradient) ──
  gradPrimary:   ['#1A1A2E', '#16213E'],
  gradAccent:    ['#4ECDC4', '#45B7AF'],
  gradWarm:      ['#FF6B6B', '#FF8E53'],
};

export const Typography = {
  h2: { fontSize: 28, fontWeight: '700' as const },
  h3: { fontSize: 22, fontWeight: '700' as const },
  h4: { fontSize: 18, fontWeight: '700' as const },
  button: { fontSize: 15, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
};

export const Font = {
  // Tailles
  xs:   11,
  sm:   13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 36,
  hero: 48,

  // Poids
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '900' as const,
};

export const Shadow = {
  xs: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  accent: {
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
};
