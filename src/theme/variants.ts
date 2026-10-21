/**
 * PetMets Design Variants — named style recipes built ONLY from tokens.
 *
 * Pages should use these (or the components in `src/components/design/`)
 * instead of writing raw Tailwind classes. To restyle every instance of a
 * pattern app-wide, change it HERE.
 *
 * Values mirror the current home page (reference design).
 */
import { cva, type VariantProps } from 'class-variance-authority';

/* ---------- Typography ---------- */

export const text = {
  /** Page / hero heading. */
  pageTitle: 'text-xl md:text-2xl font-bold font-headline tracking-tight text-foreground',
  /** Page subtitle under the title. */
  pageSubtitle: 'text-xs md:text-sm text-muted-foreground',
  /** Section heading with dot, e.g. "Top Providers". */
  sectionTitle: 'text-sm font-bold text-foreground flex items-center gap-2',
  /** Small UPPERCASE label, e.g. "UPCOMING BOOKINGS", "EMAIL ADDRESS". */
  overline: 'text-overline font-bold uppercase tracking-wider text-muted-foreground',
  /** Card item title. */
  itemTitle: 'text-label font-bold text-foreground truncate leading-tight',
  /** Card item meta (time, price, rating). */
  itemMeta: 'text-caption text-muted-foreground font-medium',
  /** "View All" style link (section headers). */
  link: 'text-caption md:text-label font-bold text-accent hover:underline inline-flex items-center gap-1',
  /** Compact "View All" link (sidebar widgets). */
  linkSm: 'text-overline font-bold text-accent hover:underline',
  /** Promo card heading. */
  promoTitle: 'text-base md:text-lg font-bold font-headline leading-[1.1]',
  /** Promo card body copy. */
  promoBody: 'text-overline md:text-caption opacity-80 max-w-[130px] leading-relaxed',
  /** Form field label (UPPERCASE, small). */
  fieldLabel: 'text-caption font-bold uppercase tracking-widest text-muted-foreground',
  /** Inline form validation error. */
  fieldError: 'text-caption text-destructive',
  /** Prominent value in a detail view, e.g. pet age. */
  value: 'text-base font-bold text-foreground',
  /** Card heading inside a page. */
  cardTitle: 'text-lg font-bold font-headline text-foreground',
} as const;

/* ---------- Layout ---------- */

export const layout = {
  /** Standard page wrapper. */
  page: 'mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6',
  /** Narrow page wrapper (forms, profile). */
  pageNarrow: 'mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6',
  section: 'space-y-3',
  /** Compact listing grid: 2 mobile → 3 tablet → 4 laptop → 5 wide screens. */
  cardGrid: 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5',
} as const;

/* ---------- Surfaces ---------- */

export const surfaceVariants = cva('rounded-card overflow-hidden', {
  variants: {
    variant: {
      /** Default white card. */
      card: 'bg-card border border-border/60 shadow-card',
      /** Card that lifts on hover (clickable list items). */
      interactive:
        'bg-card border border-border/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out group cursor-pointer',
      /** Inset row inside a card. */
      inset: 'bg-surface-subtle border border-border/40',
      /** Empty state placeholder. */
      empty: 'bg-card border border-dashed border-border text-center',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-5 md:p-8',
    },
  },
  defaultVariants: { variant: 'card', padding: 'md' },
});
export type SurfaceVariantProps = VariantProps<typeof surfaceVariants>;

/* ---------- Promo / feature cards ---------- */

export const promoVariants = cva(
  'relative overflow-hidden rounded-card border-none p-5 shadow-card group cursor-pointer h-[160px] md:h-[180px]',
  {
    variants: {
      tone: {
        forest: 'bg-brand-forest text-white',
        rose: 'bg-brand-rose-soft text-brand-rose',
        ink: 'bg-brand-ink text-white',
        accent: 'bg-accent text-accent-foreground',
        cream: 'bg-brand-cream text-foreground',
      },
    },
    defaultVariants: { tone: 'forest' },
  }
);
export type PromoTone = NonNullable<VariantProps<typeof promoVariants>['tone']>;

/* ---------- Pill buttons (CTA style used on home) ---------- */

export const pillButtonVariants = cva(
  'rounded-pill font-bold uppercase tracking-wider transition-colors',
  {
    variants: {
      tone: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow',
        light: 'bg-white hover:bg-white/90', // text color set by parent tone
        rose: 'bg-brand-rose text-white hover:bg-brand-rose/90',
      },
      size: {
        xs: 'h-6 px-4 text-overline',
        sm: 'h-7 md:h-8 px-3 md:px-4 text-overline md:text-caption',
        md: 'h-8 px-6 text-label',
        lg: 'h-7 md:h-10 px-3 md:px-8 text-overline md:text-label',
      },
    },
    defaultVariants: { tone: 'primary', size: 'md' },
  }
);
export type PillButtonVariantProps = VariantProps<typeof pillButtonVariants>;

/** Text color to pair with a "light" pill button on a given promo tone. */
export const promoLightButtonText: Record<PromoTone, string> = {
  forest: 'text-brand-forest',
  rose: 'text-brand-rose',
  ink: 'text-brand-ink',
  accent: 'text-accent',
  cream: 'text-foreground',
};

/* ---------- Badges / chips ---------- */

export const chipVariants = cva(
  'inline-flex items-center rounded-pill border-none font-bold uppercase px-1.5 py-0.5 text-micro shrink-0',
  {
    variants: {
      tone: {
        success: 'bg-status-success-soft text-status-success',
        positive: 'bg-status-positive-soft text-status-positive',
        info: 'bg-status-info-soft text-status-info',
        warning: 'bg-status-warning-soft text-status-warning',
        pending: 'bg-status-pending-soft text-status-pending',
        danger: 'bg-status-danger-soft text-status-danger',
        primary: 'bg-primary/10 text-primary',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'success' },
  }
);
export type ChipVariantProps = VariantProps<typeof chipVariants>;

/* ---------- Form inputs (soft, borderless — profile style) ---------- */

/** Booking status → chip tone (single place to restyle statuses). */
export const bookingStatusTone = {
  pending: 'pending',
  accepted: 'info',
  completed: 'positive',
  cancelled: 'danger',
} as const;

/** Extra button color recipes (applied on top of ShadCN <Button>). */
export const buttonTone = {
  /** Dark solid button (e.g. "View Details", "Save Changes"). */
  dark: 'bg-foreground text-background hover:bg-foreground/90',
  /** Positive/confirm action (e.g. "Accept"). */
  positive: 'bg-status-positive text-white hover:bg-status-positive/90',
} as const;

/** Frosted pill overlay on images (badges, ratings). */
export const imageOverlayPill = 'bg-card/90 backdrop-blur-sm text-foreground border-none shadow-card-hover rounded-pill font-bold';

export const softInput = 'bg-surface-subtle border-none rounded-lg';
/** Large floating filter control (search inputs, select triggers in filter bars). */
export const filterControl = 'h-12 bg-card border-none shadow-card rounded-card focus-visible:ring-primary/20';

/* ---------- Feature badges (icon + label tiles, e.g. Healthy / Trained) ---------- */

export const featureBadgeVariants = cva(
  'p-2 rounded-lg flex items-center gap-1.5 justify-center text-overline font-bold uppercase tracking-wider',
  {
    variants: {
      tone: {
        positive: 'bg-status-positive-soft text-status-positive',
        info: 'bg-status-info-soft text-status-info',
        warning: 'bg-status-warning-soft text-status-warning',
        success: 'bg-status-success-soft text-status-success',
      },
    },
    defaultVariants: { tone: 'positive' },
  }
);
export type FeatureBadgeVariantProps = VariantProps<typeof featureBadgeVariants>;

/* ---------- Services (icon color + soft bg per service) ---------- */

export type ServiceKey = 'match' | 'walker' | 'training' | 'grooming' | 'boarding' | 'reports' | 'playzone';

/** Static class strings so Tailwind can detect them. */
export const serviceStyles: Record<ServiceKey, { icon: string; bg: string }> = {
  match: { icon: 'text-service-match', bg: 'bg-service-match-soft' },
  walker: { icon: 'text-service-walker', bg: 'bg-service-walker-soft' },
  training: { icon: 'text-service-training', bg: 'bg-service-training-soft' },
  grooming: { icon: 'text-service-grooming', bg: 'bg-service-grooming-soft' },
  boarding: { icon: 'text-service-boarding', bg: 'bg-service-boarding-soft' },
  reports: { icon: 'text-service-reports', bg: 'bg-service-reports-soft' },
  playzone: { icon: 'text-service-playzone', bg: 'bg-service-playzone-soft' },
};
