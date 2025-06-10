
import Image from 'next/image';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 text-primary" aria-label="PetMets Logo">
      <Image
        src="/images/logo.png"
        alt="PetMets Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="font-headline text-2xl font-bold">PetMets</span>
    </div>
  );
}
