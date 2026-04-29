
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type LoginFormData = z.infer<typeof loginSchema>;

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["owner", "provider"], { required_error: "Please select an account type" }),
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
  const { register: registerSignUp, handleSubmit: handleSignUpSubmit, control: signUpControl, formState: { errors: signUpErrors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "owner"
    }
  });
  const { register: registerForgotPassword, handleSubmit: handleForgotPasswordSubmit, formState: { errors: forgotPasswordErrors }, reset: resetForgotPasswordForm } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
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
    } catch (error: any) {
      let message = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case "auth/invalid-credential":
            message = "Invalid email or password. Please check your credentials and try again.";
            break;
        case "auth/too-many-requests":
          message = "Access to this account has been temporarily disabled due to too many failed login attempts.";
          break;
        default:
          message = "Failed to login. Please try again.";
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

      const defaultName = data.role === 'owner' ? "Pet Owner" : "Service Provider";
      await updateProfile(newUser, { displayName: defaultName });

      const userDocRef = doc(db, "users", newUser.uid);
      
      const defaultUserData = {
        name: defaultName,
        email: newUser.email,
        role: data.role,
        phone: "",
        address: "",
        avatar: data.role === 'owner' ? "https://i.imgur.com/83AAQ1X.png" : "https://placehold.co/128x128.png",
        dataAiHint: data.role === 'owner' ? "paw print logo" : "business logo",
        createdAt: serverTimestamp(),
      };

      await setDoc(userDocRef, defaultUserData);

      if (data.role === 'owner') {
        const petDocRef = doc(db, "users", newUser.uid, "pets", "main-pet");
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
        await setDoc(petDocRef, defaultPetData);
      }

    } catch (error: any) {
      let message = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists.';
          break;
        default:
          message = 'Failed to sign up. Please try again.';
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
      setForgotPasswordSuccess(`If an account exists, a reset link has been sent.`);
      resetForgotPasswordForm();
    } catch (error: any) {
      setForgotPasswordError("An unexpected error occurred.");
    } finally {
      setIsForgotPasswordSubmitting(false);
    }
  };
  
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
            {isSignUp ? "Enter your details to sign up." : "Sign in to continue to PetMets."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={isSignUp ? handleSignUpSubmit(onSignUp) : handleLoginSubmit(onLogin)}>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {isSignUp && (
              <div className="space-y-3 pb-2">
                <Label>I am a...</Label>
                <Controller
                  control={signUpControl}
                  name="role"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="owner" id="r-owner" />
                        <Label htmlFor="r-owner" className="cursor-pointer">Pet Owner</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="provider" id="r-provider" />
                        <Label htmlFor="r-provider" className="cursor-pointer">Service Provider</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {signUpErrors.role && <p className="text-sm text-destructive">{signUpErrors.role.message}</p>}
              </div>
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
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signUpErrors.confirmPassword && <p className="text-sm text-destructive">{signUpErrors.confirmPassword.message}</p>}
              </div>
            )}
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <Dialog open={isForgotPasswordDialogOpen} onOpenChange={setIsForgotPasswordDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="link" type="button" className="p-0 text-sm text-primary hover:underline h-auto">
                            Forgot password?
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                                Enter your email to receive a reset link.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleForgotPasswordSubmit(onForgotPassword)}>
                            <div className="grid gap-4 py-4">
                                {forgotPasswordError && <Alert variant="destructive"><AlertDescription>{forgotPasswordError}</AlertDescription></Alert>}
                                {forgotPasswordSuccess && <Alert><AlertDescription>{forgotPasswordSuccess}</AlertDescription></Alert>}
                                {!forgotPasswordSuccess && (
                                  <div className="space-y-1">
                                      <Label htmlFor="forgot-email">Email</Label>
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
                                        Send Link
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
    </div>
  );
}
