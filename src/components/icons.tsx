import type { SVGProps } from 'react';
import { PawPrint } from 'lucide-react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="PetMets Logo">
      <PawPrint className="h-8 w-8 text-primary" {...props} />
      <span className="font-headline text-2xl font-bold text-primary">PetMets</span>
    </div>
  );
}
