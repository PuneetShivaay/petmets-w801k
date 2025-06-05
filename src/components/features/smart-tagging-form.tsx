'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getSuggestedTagsAction } from '@/app/records/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Tags, AlertCircle } from 'lucide-react';

const initialState = {
  message: '',
  tags: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Suggest Tags
    </Button>
  );
}

export function SmartTaggingForm() {
  const [state, formAction] = useFormState(getSuggestedTagsAction, initialState);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Tags className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="font-headline text-2xl">Smart Document Tagging</CardTitle>
            <CardDescription>Let AI help you organize your pet's documents by suggesting relevant tags.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="documentDescription" className="text-base">Document Description</Label>
            <Textarea
              id="documentDescription"
              name="documentDescription"
              placeholder="e.g., Vet visit receipt for vaccination on July 15th, includes rabies and distemper shots for Fluffy."
              rows={4}
              className="mt-1"
              required
              minLength={10}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Provide a brief description of the document content.
            </p>
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          
          {state.tags && state.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-md mb-2">Suggested Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {state.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          {state.tags && state.tags.length === 0 && state.message && !state.error && (
             <p className="text-muted-foreground text-sm">{state.message}</p>
          )}

        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
