"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { getSuggestedTagsAction } from "@/app/records/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Loader2, Tags, AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = {
  message: "",
  tags: [],
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full h-11 md:h-14 rounded-lg md:rounded-xl bg-primary text-sm md:text-lg font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
    >
      {pending ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          AI Tag Assist
        </>
      )}
    </Button>
  );
}

export function SmartTaggingForm() {
  const [state, formAction] = useActionState(getSuggestedTagsAction, initialState);

  return (
    <Card className="w-full rounded-xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-5 md:p-8 pb-4">
        <div className="flex items-center gap-3 mb-1 md:mb-2">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Tags className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <CardTitle className="font-headline text-xl md:text-2xl font-bold text-slate-900 leading-tight">Smart Tagging</CardTitle>
        </div>
        <CardDescription className="text-xs md:text-sm font-medium text-slate-500">
          Automatically categorize and index your pet's documents for instant retrieval.
        </CardDescription>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="p-5 md:p-8 pt-0 space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="documentDescription" className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Describe Document</Label>
            <Textarea
              id="documentDescription"
              name="documentDescription"
              placeholder="e.g., Rabies vaccine report from June 15th for Buddy."
              className="mt-1 min-h-[100px] md:min-h-[120px] rounded-lg md:rounded-xl bg-slate-50 border-none resize-none p-3 md:p-4 text-xs md:text-sm text-slate-700 placeholder:text-slate-300 focus-visible:ring-primary/20"
              required
              minLength={10}
            />
          </div>

          {state.error && (
            <Alert variant="destructive" className="rounded-lg border-none bg-red-50 text-red-600 p-3">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold text-xs">Error</AlertTitle>
              <AlertDescription className="text-[10px]">{state.error}</AlertDescription>
            </Alert>
          )}
          
          {state.tags && state.tags.length > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between">
                 <h4 className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary">AI Suggestions</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {state.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-white border-none shadow-sm text-primary font-bold px-2 py-1 rounded-lg text-[10px] md:text-xs"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-5 md:p-8 pt-0">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
