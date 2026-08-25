"use client";

import { toast } from "@/components/ui/toast";
import { verifyEmailSchema } from "@/schemas/verifyEmailSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
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

    const [timer, setTimer] = useState<number>(0);
    const [isResending, setIsResending] = useState<boolean>(false);

    const hasSentOtpRef = useRef<boolean>(false);

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
        if (isResending || timer > 0) return; //Preventing concurrent requests

        setIsResending(true);
        setTimer(30);

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
        } finally {
            setIsResending(false);
        }
    }, [isResending, timer]);

    useEffect(() => {
        if (timer <= 0) return;

        const intervalId = setInterval(
            () => setTimer((prev) => prev - 1),
            1000,
        );

        return () => clearInterval(intervalId);
    }, [timer]);

    useEffect(() => {
        if (!hasSentOtpRef.current) {
            hasSentOtpRef.current = true;
            sendOtp();
        }
    }, [sendOtp]);

    return (
        <div className="h-full w-full flex justify-center items-center">
            <Card className="h-full w-full gap-0 sm:max-w-md tracking-tight">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Verify your email</CardTitle>
                    </div>
                    <CardDescription>
                        Enter the 6-digit code sent to your email to verify your
                        email.
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
                                        <FieldLabel htmlFor="verify-email-form-number">
                                            Verification Code
                                        </FieldLabel>
                                        <InputOTP
                                            {...field}
                                            id="verify-email-form-number"
                                            aria-invalid={fieldState.invalid}
                                            maxLength={6}
                                            defaultValue="123456"
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        {isResending ? (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 justify-center">
                                <Loader2 className="h-3 w-3 animate-spin" />{" "}
                                Sending OTP...
                            </p>
                        ) : timer > 0 ? (
                            <p className="text-xs text-muted-foreground mt-2">
                                Resend code in{" "}
                                <span className="font-semibold">{timer}s</span>
                            </p>
                        ) : (
                            <p
                                onClick={sendOtp}
                                className="text-xs text-blue-700 mt-2 hover:text-blue-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Didn&apos;t receive the code? Try sending it
                                again.
                            </p>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 mt-3">
                    <Button
                        type="submit"
                        form="verify-email-form"
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
