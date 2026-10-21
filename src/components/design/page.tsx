import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { layout, text } from '@/theme/variants';

/** Standard page wrapper. Use `narrow` for form/profile pages. */
export function PageContainer({
  narrow,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { narrow?: boolean }) {
  return <div className={cn(narrow ? layout.pageNarrow : layout.page, className)} {...props} />;
}

/** Page title + optional subtitle + optional right-side actions. */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-2', className)}>
      <div>
        <h1 className={text.pageTitle}>{title}</h1>
        {subtitle && <p className={text.pageSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

/** Section heading with dot marker and optional "View All" link. */
export function SectionHeader({
  title,
  href,
  linkLabel = 'View All',
  className,
}: {
  title: React.ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between px-1', className)}>
      <h2 className={text.sectionTitle}>
        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
        {title}
      </h2>
      {href && (
        <Link href={href} className={text.link}>
          {linkLabel} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

/** Small UPPERCASE label header (sidebar widgets) with optional compact link. */
export function OverlineHeader({
  title,
  href,
  linkLabel = 'View All',
  className,
}: {
  title: React.ReactNode;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h3 className={text.overline}>{title}</h3>
      {href && (
        <Link href={href} className={text.linkSm}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
