"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Rocket, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-700 px-4">
      <div className="bg-primary/10 p-8 rounded-full">
        <Rocket className="h-16 w-16 text-primary animate-bounce" />
      </div>
      
      <div className="text-center space-y-4 max-w-lg">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-slate-900">
          Exciting Things Coming Soon!
        </h1>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed">
          We're currently building something amazing for this section. 
          Stay tuned as we continue to enhance your PetMets experience with new features and tools.
        </p>
      </div>

      <Button 
        asChild
        size="lg"
        className="rounded-xl px-8 h-12 font-bold shadow-md hover:scale-[1.02] transition-all active:scale-[0.98]"
      >
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back to home
        </Link>
      </Button>
    </div>
  );
}
