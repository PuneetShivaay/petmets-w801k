
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useLoading } from "@/contexts/loading-context";

import { AppLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type LoginFormData = z.infer<typeof loginSchema>;

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type SignUpFormData = z.infer<typeof signUpSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth(); // isLoading here is auth loading
  const { showLoading: showPageTransitionLoading } = useLoading(); // For page transitions

  const [isSignUp, setIsSignUp] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { register: registerSignUp, handleSubmit: handleSignUpSubmit, formState: { errors: signUpErrors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (!authIsLoading && user) {
      router.push('/');
    }
  }, [user, authIsLoading, router]);


  const onLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      showPageTransitionLoading(); // Show loader before router.push
      router.push('/');
    } catch (error: any) {
      setFormError(error.message || "Failed to login. Please check your credentials.");
      setIsSubmitting(false);
    }
    // No need to setIsSubmitting(false) on success because of navigation
  };

  const onSignUp: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      showPageTransitionLoading();
      router.push('/');
    } catch (error: any) {
      setFormError(error.message || "Failed to sign up. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  if (authIsLoading || (!authIsLoading && user)) {
    // Show loader if auth is loading or if user is logged in (and useEffect for redirect is about to run)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <AppLogo />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-center text-2xl sm:text-3xl">
            {isSignUp ? "Create Account" : "Welcome Back!"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Enter your details to sign up." : <><span className="hidden sm:inline">Sign in to continue to </span><span className="font-semibold"><span className="text-primary">Pet</span><span className="text-accent">Mets</span></span>.</>}
          </CardDescription>
        </CardHeader>
        <form onSubmit={isSignUp ? handleSignUpSubmit(onSignUp) : handleLoginSubmit(onLogin)}>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...(isSignUp ? registerSignUp("email") : registerLogin("email"))} />
              {isSignUp && signUpErrors.email && <p className="text-sm text-destructive">{signUpErrors.email.message}</p>}
              {!isSignUp && loginErrors.email && <p className="text-sm text-destructive">{loginErrors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...(isSignUp ? registerSignUp("password") : registerLogin("password"))} />
              {isSignUp && signUpErrors.password && <p className="text-sm text-destructive">{signUpErrors.password.message}</p>}
              {!isSignUp && loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password.message}</p>}
            </div>
            {isSignUp && (
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...registerSignUp("confirmPassword")} />
                {signUpErrors.confirmPassword && <p className="text-sm text-destructive">{signUpErrors.confirmPassword.message}</p>}
              </div>
            )}
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? <UserPlus className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />)}
              {isSignUp ? "Sign Up" : "Login"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <Button variant="link" type="button" onClick={() => { setIsSignUp(!isSignUp); setFormError(null); }} className="p-0 font-semibold text-primary hover:underline">
                {isSignUp ? "Login" : "Sign Up"}
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to{' '}
        <span className="font-semibold">
          <span className="text-primary">Pet</span><span className="text-accent">Mets</span>
        </span>
        &apos;s{' '}
        <Link href="#" className="underline hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="underline hover:text-primary">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
