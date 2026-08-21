"use client";

import { toast } from "@/components/ui/toast";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import gsap from "gsap";

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
import { Loader2, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";

const SignUpPage = () => {
    const router = useRouter();

    const [step, setStep] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] =
        useState<boolean>(false);

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            mobileNumber: "",
            state: "",
            district: "",
            cropPreferences: [],
        },
    });

  //Validation for both steps of the page
  const handleNext = async () => {
    const isStep1Valid = await form.trigger([
        "name",
        "email",
      "password",
        "confirmPassword"
    ])

    if(isStep1Valid) setStep(2)
  }

  const handleBack = () => setStep(1)

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await axios.post<ApiResponse>(
                "/api/sign-up",
                data,
            );

            if (response.data.success) {
                toast.add({
                    title: "Success",
                    description: response.data.message,
                    type: "success",
                });

                router.replace("/home");
            }
        } catch (error) {
            console.error("Error signing up user", error);
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.message || "Error signing up";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
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

  async function fetchStates() {
    const response = await axios.get(`https://api.data.gov.in/resource/a71e60f0-a21d-43de-a6c5-fa5d21600cdb?api-key=${process.env.LGD_STATES_API_KEY}&format=json`, { headers: { "Accept": "application/json" } });

    response.data?.records.forEach((record: {state_name_english: string}, idx: number) => console.log(`${idx + 1}: `, record.state_name_english))
  }

  useEffect(() => {
      fetchStates()
    }, [])

    return (
        <div className="h-full w-full flex justify-center items-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-black rounded-lg shadow-md">
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

                {/* Signup Form */}
                <Card className="w-full sm:max-w-md tracking-tight">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Create your account</CardTitle>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                                Step {step} of 2
                            </span>
                        </div>
                        <CardDescription>
                            {step === 1
                                ? "Enter your account details to get started."
                                : "Tell us about your location and preferences."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldGroup>
                                {step === 1 && (
                                    <>
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-name">
                                                        Name
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-name"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="Ravi Kishore"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-email">
                                                        Email
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-email"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="ravi.kishore@gmail.com"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="password"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-password">
                                                        Password
                                                    </FieldLabel>
                                                    <div className="flex justify-center items-center gap-1">
                                                        <Input
                                                            type={passwordVisible ? "text" : "password"}
                                                            {...field}
                                                            id="signup-form-password"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="Strong Password"
                                                        />
                                                        {passwordVisible ? (
                                                            <EyeOff
                                                                className="cursor-pointer"
                                                                onClick={() => setPasswordVisible((prev) => !prev)}
                                                            />
                                                        ) : (
                                                            <Eye
                                                                className="cursor-pointer"
                                                                onClick={() => setPasswordVisible((prev) => !prev)}
                                                            />
                                                        )}
                                                    </div>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="confirmPassword"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-confirm-password">
                                                        Confirm Password
                                                    </FieldLabel>
                                                    <div className="flex justify-center items-center gap-1">
                                                        <Input
                                                            type={confirmPasswordVisible ? "text" : "password"}
                                                            {...field}
                                                            id="signup-form-confirm-password"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="Repeat Your Password"
                                                        />
                                                        {confirmPasswordVisible ? (
                                                            <EyeOff
                                                                className="cursor-pointer"
                                                                onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                                                            />
                                                        ) : (
                                                            <Eye
                                                                className="cursor-pointer"
                                                                onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                                                            />
                                                        )}
                                                    </div>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <Controller
                                            name="mobileNumber"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-number">
                                                        Mobile Number
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-number"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="9876543210"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="state"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-state">
                                                        State
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-state"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="Punjab"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="district"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor="signup-form-district">
                                                        District
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-district"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="Ludhiana"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    </>
                                )}
                            </FieldGroup>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <div className="flex w-full gap-2">
                            {step === 2 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={isSubmitting}
                                    className="w-1/2"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                                </Button>
                            )}

                            {step === 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    form="signup-form"
                                    disabled={isSubmitting}
                                    className="w-1/2 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Get Started"
                                    )}
                                </Button>
                            )}
                        </div>

                        <div>
                            <p className="text-sm">
                                Already a member?{" "}
                                <Link
                                    href="/sign-in"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
export default SignUpPage;
