
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  children?: ReactNode; // For actions like buttons
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              {typeof description === 'string' ? description : description}
            </p>
          )}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
