/**
 * PetMets Design Tokens — SINGLE SOURCE OF TRUTH for raw design values.
 *
 * Values are extracted from the current home page (the reference design).
 * Consumed by `tailwind.config.ts`, so every token becomes a Tailwind class:
 *   colors.brand.forest   -> bg-brand-forest / text-brand-forest / bg-brand-forest/90
 *   colors.service.walker -> text-service-walker / bg-service-walker-soft
 *   fontSize.caption      -> text-caption
 *
 * To restyle the app, change values HERE — not in page files.
 *
 * Note: core theme colors (primary, accent, background, muted, border…) stay in
 * `src/app/globals.css` as CSS variables because ShadCN components depend on them.
 */

export const colors = {
  /** Secondary brand palette used by promo/feature cards. */
  brand: {
    forest: '#466935', // "Book services" promo card
    rose: {
      DEFAULT: '#802D52', // Pet Store text / button
      soft: '#F8D2E2', // Pet Store card background
    },
    ink: '#0D2B2B', // Pet Reports promo card
    cream: '#FFF3E0', // Highlight / offer card background
    amber: '#F4A261', // Highlight / offer card title
    moss: '#2D4A22', // Provider detail "trust" card
  },

  /** Per-service identity colors (icon color + soft tile background). */
  service: {
    match: { DEFAULT: '#E63946', soft: '#FFEBEE' },
    walker: { DEFAULT: '#2A9D8F', soft: '#E0F2F1' },
    training: { DEFAULT: '#457B9D', soft: '#E1F5FE' },
    grooming: { DEFAULT: '#F4A261', soft: '#FFF3E0' },
    boarding: { DEFAULT: '#1D3557', soft: '#E8EAF6' },
    reports: { DEFAULT: '#264653', soft: '#F1F8E9' },
    playzone: { DEFAULT: '#E76F51', soft: '#FBE9E7' },
  },

  /** Neutral surfaces used inside cards (in addition to `bg-card`). */
  surface: {
    subtle: '#F8FAFC', // inset rows inside cards
  },

  /** Status colors (badges, chips). */
  status: {
    success: { DEFAULT: '#2A9D8F', soft: '#E0F2F1' },
    positive: { DEFAULT: '#15803D', soft: '#F0FDF4' }, // = green-700 / green-50
    info: { DEFAULT: '#1D4ED8', soft: '#EFF6FF' }, // = blue-700 / blue-50
    warning: { DEFAULT: '#C2410C', soft: '#FFF7ED' }, // = orange-700 / orange-50
    pending: { DEFAULT: '#A16207', soft: '#FEFCE8' }, // = yellow-700 / yellow-50
    danger: { DEFAULT: '#B91C1C', soft: '#FEF2F2' }, // = red-700 / red-50
  },

  /** Star rating color (= Tailwind yellow-400). */
  rating: '#FACC15',
} as const;

/**
 * Type scale — matches current compact density.
 * Format: [fontSize, { lineHeight }]
 */
export const fontSize = {
  // Premium scale: nothing below 10px — tiny text reads as "cheap".
  micro: ['10px', { lineHeight: '1.3', letterSpacing: '0.01em' }], // tiny meta (dates, sub-labels)
  overline: ['10px', { lineHeight: '1.4', letterSpacing: '0.08em' }], // UPPERCASE section labels, small CTAs
  caption: ['11px', { lineHeight: '1.45' }], // card meta, ratings
  label: ['12.5px', { lineHeight: '1.45' }], // card titles, descriptions
  'label-lg': ['13.5px', { lineHeight: '1.45' }],
} as const;

export const borderRadius = {
  card: '1.125rem', // soft, modern card corners (18px)
  pill: '9999px', // CTA buttons
} as const;

/** Layered, low-opacity, slightly tinted shadows — the key to a premium feel. */
export const boxShadow = {
  card: '0 1px 2px rgb(16 24 40 / 0.04), 0 4px 16px -4px rgb(16 24 40 / 0.08)',
  'card-hover': '0 2px 4px rgb(16 24 40 / 0.04), 0 16px 32px -8px rgb(16 24 40 / 0.14)',
  glow: '0 8px 24px -6px hsl(15 100% 59% / 0.45)', // primary CTA glow
} as const;

export const tokens = { colors, fontSize, borderRadius, boxShadow };
export default tokens;
