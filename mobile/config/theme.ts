// ============================================================================
// CBH FASTENERS MOBILE APP - DESIGN SYSTEM & THEME TOKENS
// ============================================================================

export const MOBILE_THEME = {
  colors: {
    // Brand Primary (Enterprise Royal Blue)
    primary: '#0052CC',
    primaryLight: '#EFF6FF',
    primaryDark: '#003685',
    primaryBorder: '#BFDBFE',

    // Accent (Industrial Amber / Safety Orange)
    accent: '#FF6B00',
    accentLight: '#FFF7ED',
    accentDark: '#C2410C',

    // Status & System Signals
    success: '#10B981',
    successLight: '#ECFDF5',
    successBorder: '#A7F3D0',
    
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    warningBorder: '#FDE68A',
    
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    dangerBorder: '#FECACA',
    
    info: '#3B82F6',
    infoLight: '#EFF6FF',
    infoBorder: '#BFDBFE',

    // Neutral Surfaces & Typography
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardHover: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Industrial Dark Mode (for telemetry / operator views)
    darkSurface: '#0F172A',
    darkCard: '#1E293B',
    darkBorder: '#334155',
  },

  typography: {
    fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      md: '15px',
      lg: '17px',
      xl: '20px',
      xxl: '24px',
      title: '28px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800,
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },

  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
    md: '0 4px 12px rgba(15, 23, 42, 0.08)',
    lg: '0 10px 25px rgba(15, 23, 42, 0.12)',
    bottomNav: '0 -4px 16px rgba(15, 23, 42, 0.06)',
    topBar: '0 2px 8px rgba(15, 23, 42, 0.04)',
  },

  zIndex: {
    base: 1,
    header: 40,
    bottomNav: 50,
    modal: 100,
    toast: 150,
  },
} as const;

export default MOBILE_THEME;

