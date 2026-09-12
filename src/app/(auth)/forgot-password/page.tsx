"use client";

import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema } from "@/schemas/forgotPasswordSchema";
import { ApiResponse } from "@/types/ApiResponse";

// Shadcn components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

const ForgotPasswordPage = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [disableSending, setDisableSending] = useState<boolean>(false);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await axios.post<ApiResponse>("/api/forgot-password", data);

            if (response.data.success) {
                toast.add({
                    title: "Success",
                    description:
                        response.data.message || "Password reset link sent",
                    type: "success",
                });
                form.reset();
                setDisableSending(true);
            }
        } catch (error) {
            console.error("Error sending reset email:", error);

            const axiosError = error as AxiosError<{ error?: string }>;
            const errorMessage =
                axiosError.response?.data.error || "Error in password reset";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent backdrop-blur-2xl rounded-md min-h-screen p-4">
            <Card className="w-full max-w-md tracking-tight bg-transparent backdrop-blur-xl rounded-xl z-10 shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Forgot Password
                    </CardTitle>
                    <CardDescription>
                        Enter your registered email address and we&apos;ll send
                        you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="forgot-password-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="forgot-password-email">
                                            Email Address
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="forgot-password-email"
                                            type="email"
                                            placeholder="ravi.kishore@example.com"
                                            aria-invalid={fieldState.invalid}
                                            disabled={isSubmitting}
                                        />
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
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        form="forgot-password-form"
                        className="w-full"
                        disabled={isSubmitting || disableSending}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>

                    <div className="text-center text-sm">
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center gap-1 text-foreground hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
