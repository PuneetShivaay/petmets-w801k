import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  promoVariants,
  pillButtonVariants,
  promoLightButtonText,
  serviceStyles,
  text,
  type PromoTone,
  type ServiceKey,
} from '@/theme/variants';

/** Colored promo/feature card with CTA and corner image (home page style). */
export function PromoCard({
  tone,
  eyebrow,
  title,
  description,
  icon: Icon,
  ctaLabel,
  href,
  imageUrl,
  imageAlt = '',
  className,
}: {
  tone: PromoTone;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  ctaLabel: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  className?: string;
}) {
  // "rose" uses a solid dark CTA; other tones use a white CTA tinted to the card.
  const ctaClass =
    tone === 'rose'
      ? pillButtonVariants({ tone: 'rose', size: 'sm' })
      : cn(pillButtonVariants({ tone: 'light', size: 'sm' }), promoLightButtonText[tone]);

  return (
    <div className={cn(promoVariants({ tone }), className)}>
      <div className="relative z-10 h-full flex flex-col justify-between items-start">
        <div className={Icon ? 'space-y-2' : 'space-y-1'}>
          {eyebrow && <p className="text-micro md:text-overline font-bold uppercase tracking-wider opacity-60">{eyebrow}</p>}
          {Icon ? (
            <div className="flex items-center gap-1.5">
              <Icon className="h-3 w-3 md:h-4 md:w-4" />
              <h3 className={text.promoTitle}>{title}</h3>
            </div>
          ) : (
            <h3 className={text.promoTitle}>{title}</h3>
          )}
          {description && <p className={text.promoBody}>{description}</p>}
        </div>
        <Link href={href} className={cn('inline-flex items-center normal-case tracking-normal', ctaClass)}>
          {ctaLabel} <ArrowRight className="ml-1 h-2.5 w-2.5 md:h-3 md:w-3" />
        </Link>
      </div>
      {imageUrl && (
        <div className="absolute bottom-2 right-2 w-24 h-24 md:w-28 md:h-28 group-hover:scale-105 transition-transform duration-500">
          <Image src={imageUrl} alt={imageAlt} fill sizes="112px" className="object-cover rounded-lg" />
        </div>
      )}
    </div>
  );
}

/** Round service icon tile with title + description (home service grid). */
export function ServiceTile({
  service,
  icon: Icon,
  title,
  description,
  href,
}: {
  service: ServiceKey;
  icon: LucideIcon;
  title: string;
  description?: string;
  href: string;
}) {
  const s = serviceStyles[service];
  return (
    <Link href={href} className="flex flex-col items-center group text-center">
      <div
        className={cn(
          'h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all shadow-card group-hover:shadow-card-hover mb-2 md:mb-3',
          s.bg,
          s.icon
        )}
      >
        <Icon className="h-5 w-5 md:h-6 md:w-6" />
      </div>
      <span className="text-xs font-bold text-foreground leading-tight">{title}</span>
      {description && <p className="text-label text-muted-foreground mt-1 leading-tight">{description}</p>}
    </Link>
  );
}
