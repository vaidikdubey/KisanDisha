"use client";

import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordSchema } from "@/schemas/resetPasswordSchema";
import { ApiResponse } from "@/types/ApiResponse";

//ShadCn Components
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
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] =
        useState<boolean>(false);

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
        if (!token) {
            toast.add({
                title: "Error",
                description: "Invalid or missing reset token. Please request a new password reset link.",
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post<ApiResponse>("/api/reset-password", {
                password: data.password,
                token: token,
            });

            if (response.data.success) {
                toast.add({
                    title: "Success",
                    description: response.data.message || "Password reset successful",
                    type: "success",
                });
                form.reset();
                router.replace("/sign-in");
            }
        } catch (error) {
            console.error("Error resetting password:", error);

            const axiosError = error as AxiosError<{ error?: string }>;
            const errorMessage =
                axiosError.response?.data?.error || "Error resetting password";

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
                        Reset Password
                    </CardTitle>
                    <CardDescription>
                        Please enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="reset-password-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            {/* Password Field */}
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="reset-password-input">
                                            New Password
                                        </FieldLabel>
                                        <div className="flex justify-center items-center gap-1">
                                            <Input
                                                {...field}
                                                id="reset-password-input"
                                                type={
                                                    passwordVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Enter new password"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isSubmitting}
                                            />
                                            {passwordVisible ? (
                                                <EyeOff
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setPasswordVisible(
                                                            (prev) => !prev
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Eye
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setPasswordVisible(
                                                            (prev) => !prev
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

                            {/* Confirm Password Field */}
                            <Controller
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="reset-form-confirm-password">
                                            Confirm Password
                                        </FieldLabel>
                                        <div className="flex justify-center items-center gap-1">
                                            <Input
                                                {...field}
                                                id="reset-form-confirm-password"
                                                type={
                                                    confirmPasswordVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Repeat Your Password"
                                                aria-invalid={fieldState.invalid}
                                                disabled={isSubmitting}
                                            />
                                            {confirmPasswordVisible ? (
                                                <EyeOff
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setConfirmPasswordVisible(
                                                            (prev) => !prev
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Eye
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        setConfirmPasswordVisible(
                                                            (prev) => !prev
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
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        form="reset-password-form"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting Password...
                            </>
                        ) : (
                            "Reset Password"
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

export default ResetPasswordPage;