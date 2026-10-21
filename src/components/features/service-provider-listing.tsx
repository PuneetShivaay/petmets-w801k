"use client";

import { useState, useEffect, type ReactNode } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { surfaceVariants } from "@/theme/variants";

export interface ServiceProvider {
  id: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  rating: number;
  email?: string;
  phone?: string;
}

interface ServiceProviderListingProps {
  /** Firestore `service` field value, e.g. "Walking". */
  service: string;
  /** Optional page heading above the intro. */
  title?: string;
  intro: string;
  cta: { label: string; href: string; icon: LucideIcon };
  emptyText: string;
  /** Tailwind height class for the card image. */
  imageHeight?: string;
  /** Default card action button. Ignored when `renderAction` is supplied. */
  action?: { label: string; icon?: LucideIcon };
  renderAction?: (provider: ServiceProvider) => ReactNode;
}

/** Shared listing used by all service pages (walkers, grooming, training, …). */
export function ServiceProviderListing({
  service,
  title,
  intro,
  cta,
  emptyText,
  imageHeight = "h-52",
  action,
  renderAction,
}: ServiceProviderListingProps) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "service_providers"), where("service", "==", service));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setProviders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceProvider)));
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${service} providers:`, error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [service]);

  const CtaIcon = cta.icon;
  const ActionIcon = action?.icon;

  return (
    <div className="space-y-6">
      <div className="text-center">
        {title && <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>}
        <p className={cn("text-muted-foreground", title && "mt-4 text-lg")}>{intro}</p>
        <Button asChild size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={cta.href}>
            <CtaIcon className="mr-2 h-5 w-5" /> {cta.label}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-card" />)
        ) : providers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <CtaIcon className="mx-auto h-12 w-12" />
            <p className="mt-4">{emptyText}</p>
          </div>
        ) : (
          providers.map((p) => (
            <Card
              key={p.id}
              className={cn(surfaceVariants({ variant: "card", padding: "none" }), "flex flex-col overflow-hidden")}
            >
              <div className={cn("relative w-full", imageHeight)}>
                <Image
                  src={p.image || "/images/logo.png"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">{p.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" /> {p.location}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-2 line-clamp-3 text-sm text-muted-foreground">&ldquo;{p.bio}&rdquo;</p>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-rating text-rating" /> {p.rating} stars
                </div>
              </CardContent>
              <CardFooter>
                {renderAction ? (
                  renderAction(p)
                ) : (
                  <Button variant="outline" className="w-full">
                    {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />} {action?.label ?? "View Details"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
