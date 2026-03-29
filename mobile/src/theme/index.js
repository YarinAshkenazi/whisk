export const colors = {
  background: '#1A1A2E',
  surface: '#16213E',
  card: '#0F3460',
  cardLight: '#1A4080',
  primary: '#E94560',
  accent: '#D4A147',
  gold: '#C9A84C',
  amber: '#F5A623',
  text: '#FFFFFF',
  textSecondary: '#B0B0C8',
  textMuted: '#6B6B8D',
  border: '#2A2A4A',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  inputBg: '#1E2745',
  overlay: 'rgba(0,0,0,0.6)',
  statusClosed: '#4CAF50',
  statusOpened: '#FF9800',
  statusFinished: '#9E9E9E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
