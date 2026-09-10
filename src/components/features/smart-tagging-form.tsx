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
      className="w-full h-14 rounded-2xl bg-primary text-lg font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
    >
      {pending ? (
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          AI Tag Assist
        </>
      )}
    </Button>
  );
}

export function SmartTaggingForm() {
  const [state, formAction] = useActionState(getSuggestedTagsAction, initialState);

  return (
    <Card className="w-full rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Tags className="h-6 w-6" />
          </div>
          <CardTitle className="font-headline text-2xl font-bold text-slate-900 leading-tight">Smart Tagging</CardTitle>
        </div>
        <CardDescription className="text-sm font-medium text-slate-500">
          Leverage AI to automatically categorize and index your pet's documents for instant retrieval.
        </CardDescription>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="documentDescription" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Describe Document Content</Label>
            <Textarea
              id="documentDescription"
              name="documentDescription"
              placeholder="e.g., Rabies vaccine report from June 15th for Buddy. Includes distemper and parvovirus shots."
              className="mt-1 min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none p-4 text-slate-700 placeholder:text-slate-300 focus-visible:ring-primary/20"
              required
              minLength={10}
            />
          </div>

          {state.error && (
            <Alert variant="destructive" className="rounded-2xl border-none bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Optimization Error</AlertTitle>
              <AlertDescription className="text-xs">{state.error}</AlertDescription>
            </Alert>
          )}
          
          {state.tags && state.tags.length > 0 && (
            <div className="space-y-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Suggested AI Tags</h4>
                 <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[8px] font-bold uppercase text-primary">Verified</span>
                 </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-white border-none shadow-sm text-primary font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-110"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {state.tags && state.tags.length === 0 && state.message && !state.error && (
             <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-50 text-slate-400 text-xs italic">
                <Zap className="h-4 w-4" />
                {state.message}
             </div>
          )}
        </CardContent>

        <CardFooter className="p-8 pt-0">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
