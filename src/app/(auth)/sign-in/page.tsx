"use client";

import { signInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import gsap from "gsap";

//Shadcn components
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

const SignInPage = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    //zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    //Credentials sign-in handler
    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true);

        const result = await signIn("credentials", {
            redirect: true,
            callbackUrl: "/home",
            email: data.email,
            password: data.password,
        });

        if (result?.error) {
            if (result.error === "CredentialsSignin")
                toast.add({
                    title: "Error",
                    description: "Invalid credentials",
                    type: "error",
                });
            else
                toast.add({
                    title: "Error",
                    description: result.error,
                    type: "error",
                });
        }

        setIsSubmitting(false);
    };

    //Google/OAuth sign-in handler
    const handleOAuthSignIn = (provider: string) => {
        signIn(provider, { callbackUrl: "/home" });
    };

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1 });

        tl.to(cardRef.current, {
            rotateY: 180,
            duration: 1,
            ease: "power2.inOut",
            delay: 1.5,
        }).to(cardRef.current, {
            rotateY: 360,
            duration: 1,
            ease: "power2.inOut",
            delay: 1.5,
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="flex justify-center items-center bg-transparent backdrop-blur-3xl rounded-md">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
                <div className="text-center">
                    {/* Flipping Card */}
                    <div
                        ref={cardRef}
                        className="relative w-full h-full rounded-2xl shadow-xl transform-3d"
                    >
                        {/* Front Side: English */}
                        <h1 className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 text-3xl font-bold tracking-wide backface-hidden">
                            KisanDisha
                        </h1>

                        {/* Back Side: Hindi */}
                        <h1 className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 text-3xl font-bold tracking-wide backface-hidden transform-[rotateY(180deg)]">
                            किसान दिशा
                        </h1>
                    </div>
                </div>

                {/* Signin Form */}
                <Card className="w-full sm:max-w-md tracking-tight bg-transparent backdrop-blur-xl rounded-xl z-10">
                    <CardHeader>
                        <CardTitle>Access your account</CardTitle>
                        <CardDescription>
                            Log in to check today&apos;s prices and schedule.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            id="signin-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FieldGroup>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel htmlFor="signin-form-email">
                                                Email
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="signin-form-email"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Your Registered Email"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel htmlFor="signin-form-password">
                                                Password
                                            </FieldLabel>
                                            <div className="flex justify-center items-center gap-1">
                                                <Input
                                                    type={
                                                        passwordVisible
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    {...field}
                                                    id="signup-form-password"
                                                    aria-invalid={
                                                        fieldState.invalid
                                                    }
                                                    placeholder="Strong Password"
                                                />{" "}
                                                {passwordVisible ? (
                                                    <EyeOff
                                                        onClick={() =>
                                                            setPasswordVisible(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <Eye
                                                        onClick={() =>
                                                            setPasswordVisible(
                                                                (prev) => !prev,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Field orientation="responsive">
                            <Button
                                type="submit"
                                form="signin-form"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        {" "}
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                        Refreshing your dashboard{" "}
                                    </>
                                ) : (
                                    "Continue Exploring"
                                )}
                            </Button>
                        </Field>

                        <div className="relative w-full my-1 flex items-center justify-center">
                            <div className="border-t border-gray-300 w-full" />
                            <span className="bg-white px-2 text-xs text-gray-500 uppercase absolute">
                                Or
                            </span>
                        </div>

                        <div className="w-full flex flex-col justify-center items-center gap-2">
                            {/* Google Sign-In Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOAuthSignIn("google")}
                                className="w-full flex items-center justify-center gap-2 text-white border-black"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign In with Google
                            </Button>
                        </div>

                        <div>
                            <p>
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/sign-up"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
export default SignInPage;
