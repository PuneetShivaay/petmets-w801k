import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  surfaceVariants,
  chipVariants,
  pillButtonVariants,
  featureBadgeVariants,
  text,
  type SurfaceVariantProps,
  type ChipVariantProps,
  type PillButtonVariantProps,
  type FeatureBadgeVariantProps,
} from '@/theme/variants';

/** Icon + label tile, e.g. "Healthy", "Trained", "Verified". */
export function FeatureBadge({
  icon,
  tone,
  children,
  className,
}: { icon?: React.ReactNode; children: React.ReactNode; className?: string } & FeatureBadgeVariantProps) {
  return (
    <div className={cn(featureBadgeVariants({ tone }), className)}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

/** Themed card surface. variant: card | interactive | inset | empty. */
export const Surface = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SurfaceVariantProps
>(({ className, variant, padding, ...props }, ref) => (
  <div ref={ref} className={cn(surfaceVariants({ variant, padding }), className)} {...props} />
));
Surface.displayName = 'Surface';

/** Small status chip, e.g. "Confirmed". */
export function Chip({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & ChipVariantProps) {
  return <span className={cn(chipVariants({ tone }), className)} {...props} />;
}

/** Rounded CTA button used across the app. */
export const PillButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & PillButtonVariantProps
>(({ className, tone, size, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-1 disabled:pointer-events-none disabled:opacity-50',
      pillButtonVariants({ tone, size }),
      className
    )}
    {...props}
  />
));
PillButton.displayName = 'PillButton';

/** Labelled value row (icon + overline label + value), e.g. profile contact details. */
export function InfoRow({
  icon,
  label,
  children,
  className,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(surfaceVariants({ variant: 'inset', padding: 'none' }), 'flex items-start gap-3 p-2.5', className)}>
      {icon && (
        <div className="h-7 w-7 rounded-lg bg-card shadow-card flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={text.overline}>{label}</p>
        <div className="text-xs font-bold text-foreground truncate">{children}</div>
      </div>
    </div>
  );
}

/** Empty-state placeholder. */
export function EmptyState({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(surfaceVariants({ variant: 'empty', padding: 'none' }), 'py-6', className)}>
      <p className={cn(text.overline, 'tracking-widest')}>{children}</p>
    </div>
  );
}
