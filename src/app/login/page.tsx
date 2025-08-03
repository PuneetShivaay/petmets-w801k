
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useLoading } from "@/contexts/loading-context";

import { AppLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { LogIn, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
});
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();
  const { showLoading: showPageTransitionLoading } = useLoading();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for Forgot Password Dialog
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null);
  const [isForgotPasswordSubmitting, setIsForgotPasswordSubmitting] = useState(false);


  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { register: registerSignUp, handleSubmit: handleSignUpSubmit, formState: { errors: signUpErrors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });
  const { register: registerForgotPassword, handleSubmit: handleForgotPasswordSubmit, formState: { errors: forgotPasswordErrors }, reset: resetForgotPasswordForm } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });


  useEffect(() => {
    // This effect handles the redirect after the user state is confirmed.
    // AppLayout will handle redirecting away from login if the user is already logged in.
    if (!authIsLoading && user) {
      router.push('/');
    }
  }, [user, authIsLoading, router]);


  const onLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // The useEffect hook and AppLayout will handle the redirect.
    } catch (error: any) {
      let message = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case "auth/invalid-credential":
            message = "Invalid email or password. Please check your credentials and try again.";
            break;
        case "auth/too-many-requests":
          message = "Access to this account has been temporarily disabled due to too many failed login attempts. You can try again later or reset your password.";
          break;
        default:
          message = "Failed to login. Please try again.";
          console.error("Login error:", error.message, "Code:", error.code);
      }
      setFormError(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const onSignUp: SubmitHandler<SignUpFormData> = async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      const defaultOwnerName = "Pet Owner";
      await updateProfile(newUser, { displayName: defaultOwnerName });

      const userDocRef = doc(db, "users", newUser.uid);
      const petDocRef = doc(db, "users", newUser.uid, "pets", "main-pet");

      const defaultOwnerData = {
        name: defaultOwnerName,
        email: newUser.email,
        phone: "",
        address: "",
        avatar: "https://i.imgur.com/83AAQ1X.png",
        dataAiHint: "paw print logo",
        createdAt: serverTimestamp(),
      };

      const defaultPetData = {
        name: "Buddy",
        breed: "Golden Retriever",
        age: "3 years",
        gender: "Male",
        avatar: "https://placehold.co/128x128.png",
        dataAiHint: "golden retriever",
        bio: "Loves long walks in the park and playing fetch. A very good boy indeed!",
        createdAt: serverTimestamp(),
      };

      await Promise.all([
        setDoc(userDocRef, defaultOwnerData),
        setDoc(petDocRef, defaultPetData),
      ]);

      // No need to manually redirect here. The onAuthStateChanged listener
      // in AuthProvider will detect the new user, and the useEffect hook in this
      // component or the AppLayout will handle the redirect.
      
    } catch (error: any)
{
      let message = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists. Please login or use a different email.';
          break;
        default:
          message = 'Failed to sign up. Please try again.';
          console.error("Sign up error:", error);
      }
      setFormError(message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const onForgotPassword: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsForgotPasswordSubmitting(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setForgotPasswordSuccess(`If an account exists for ${data.email}, a password reset link has been sent. Please check your inbox (and spam folder).`);
      resetForgotPasswordForm();
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setForgotPasswordError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setIsForgotPasswordSubmitting(false);
    }
  };
  
  // This loader is for when the page is accessed directly and auth is still initializing.
  // Or when navigating away after a successful login/signup.
  if (authIsLoading) {
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
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  {...(isSignUp ? registerSignUp("password") : registerLogin("password"))} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {isSignUp && signUpErrors.password && <p className="text-sm text-destructive">{signUpErrors.password.message}</p>}
              {!isSignUp && loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password.message}</p>}
            </div>
            {isSignUp && (
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    {...registerSignUp("confirmPassword")} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signUpErrors.confirmPassword && <p className="text-sm text-destructive">{signUpErrors.confirmPassword.message}</p>}
              </div>
            )}
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <Dialog open={isForgotPasswordDialogOpen} onOpenChange={(open) => {
                    setIsForgotPasswordDialogOpen(open);
                    if (!open) {
                        setForgotPasswordError(null);
                        setForgotPasswordSuccess(null);
                        resetForgotPasswordForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button variant="link" type="button" className="p-0 text-sm text-primary hover:underline h-auto">
                            Forgot password?
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reset Your Password</DialogTitle>
                            <DialogDescription>
                                Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleForgotPasswordSubmit(onForgotPassword)}>
                            <div className="grid gap-4 py-4">
                                {forgotPasswordError && (
                                  <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{forgotPasswordError}</AlertDescription>
                                  </Alert>
                                )}
                                {forgotPasswordSuccess && (
                                  <Alert>
                                    <AlertTitle>Success!</AlertTitle>
                                    <AlertDescription>{forgotPasswordSuccess}</AlertDescription>
                                  </Alert>
                                )}

                                {!forgotPasswordSuccess && (
                                  <div className="space-y-1">
                                      <Label htmlFor="forgot-email" className="text-left">Email Address</Label>
                                      <Input id="forgot-email" type="email" placeholder="you@example.com" {...registerForgotPassword("email")} />
                                      {forgotPasswordErrors.email && <p className="text-sm text-destructive">{forgotPasswordErrors.email.message}</p>}
                                  </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsForgotPasswordDialogOpen(false)}>Cancel</Button>
                                {!forgotPasswordSuccess && (
                                    <Button type="submit" disabled={isForgotPasswordSubmitting}>
                                        {isForgotPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Reset Link
                                    </Button>
                                )}
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
        <a href="#" className="underline hover:text-primary">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

    
    