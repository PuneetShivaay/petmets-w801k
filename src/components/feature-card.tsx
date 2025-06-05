import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  actionText?: string;
}

export function FeatureCard({ icon: Icon, title, description, href, actionText = "Explore" }: FeatureCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-lg shadow-lg transition-shadow hover:shadow-xl">
      <CardHeader className="flex flex-row items-center gap-4 p-6">
        <Icon className="h-10 w-10 text-primary" />
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <CardDescription className="text-base text-muted-foreground">{description}</CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Link href={href} passHref>
          <Button variant="outline" className="w-full group">
            {actionText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
