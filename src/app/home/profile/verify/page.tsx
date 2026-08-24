"use client";

import { toast } from "@/components/ui/toast";
import { verifyEmailSchema } from "@/schemas/verifyEmailSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

//ShadCn components
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
import { Loader2 } from "lucide-react";

const VerifyPage = () => {
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const form = useForm<z.infer<typeof verifyEmailSchema>>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            code: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof verifyEmailSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await axios.post<ApiResponse>("/api/verify", data);

            if (response.data.success) {
                toast.add({
                    title: "Success",
                    description: response.data.message,
                    type: "success",
                });

                router.replace("/home/profile");
            }
        } catch (error) {
            console.error("Error verifying email", error);
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.error || "Error verifying email";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendOtp = useCallback(async () => {
        try {
            const response = await axios.get<ApiResponse>("/api/verify");

            if (response.data.success)
                toast.add({
                    title: "Success",
                    description: response.data.message,
                    type: "success",
                });

            return;
        } catch (error) {
            console.error("Error sending OTP", error);
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.error ||
                "Error sending OTP. Please try again later";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        }
    }, []);

    // useEffect(() => {
    //     sendOtp();
    // }, []);

    return (
        <div className="h-full w-full flex justify-center items-center">
            <Card className="h-full w-full gap-0 sm:max-w-md tracking-tight">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Verify your email</CardTitle>
                    </div>
                    <CardDescription>
                        Enter the 6-digit code sent to your email to verify your email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        id="verify-email-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="signup-form-number">
                                            Verification Code
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="verify-email-form-code"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="123456"
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
                <CardFooter className="flex flex-col gap-3 mt-3">
                    <Button
                        type="submit"
                        form="signup-form"
                        disabled={isSubmitting}
                        className="w-1/2 flex items-center justify-center gap-2 rounded-md"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
export default VerifyPage;
