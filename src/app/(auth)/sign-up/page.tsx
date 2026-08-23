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
import { StateRecord } from "@/types/States";
import { DistrictRecord } from "@/types/Districts";
import { signIn } from "next-auth/react";

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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";

const cropsList = [
    { label: "Rice", value: "Rice / धान" },
    { label: "Wheat", value: "Wheat / गेहूं" },
    { label: "Sugarcane", value: "Sugarcane / गन्ना" },
    { label: "Cotton", value: "Cotton / कपास" },
    { label: "Soybean", value: "Soybean / सोयाबीन" },
    { label: "Mustard", value: "Mustard / सरसों" },
    { label: "Chana (Bengal Gram)", value: "Chana (Bengal Gram) / चना" },
    { label: "Maize (Corn)", value: "Maize (Corn) / मक्का" },
    { label: "Bajra (Pearl Millet)", value: "Bajra (Pearl Millet) / बाजरा" },
    { label: "Potato", value: "Potato / आलू" },
];

const SignUpPage = () => {
    const router = useRouter();

    const [step, setStep] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] =
        useState<boolean>(false);
    const [statesList, setStatesList] = useState<StateRecord[]>([]);
    const [districtsList, setDistrictsList] = useState<DistrictRecord[]>([]);

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
            "confirmPassword",
        ]);

        if (isStep1Valid) setStep(2);
    };

    const handleBack = () => setStep(1);

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

    //Redirection to "/onboarding" page will be automatically handled by pages on backend. We always provide post-authentication page. In case if a already created user also clicks google here they will be redirected here (home) post authentication.
    const handleOAuthSignIn = (provider: string) => { 
        signIn(provider, {callbackUrl: "/home"})
    }

    async function fetchStates() {
        const response = await axios.get("/api/get-states");

        setStatesList(response.data.data?.states);
    }

    async function fetchDistricts(stateCode: number) {
        const response = await axios.get(
            `/api/get-districts?state=${stateCode}`,
        );

        setDistrictsList(response.data.data?.districts);
    }

    useEffect(() => {
        //eslint-disable-next-line
        fetchStates();
    }, []);

    return (
        <div className="h-full w-full flex justify-center items-center bg-transparent backdrop-blur-2xl rounded-md">
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

                {/* Signup Form */}
                <Card className="w-full gap-0 sm:max-w-md tracking-tight bg-transparent backdrop-blur-xl rounded-xl z-10">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Create account</CardTitle>
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
                        <form
                            id="signup-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FieldGroup>
                                {step === 1 && (
                                    <>
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-name">
                                                        Name
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-name"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        placeholder="Ravi Kishore"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-email">
                                                        Email
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-email"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        placeholder="ravi.kishore@gmail.com"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
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
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-password">
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
                                                        />
                                                        {passwordVisible ? (
                                                            <EyeOff
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    setPasswordVisible(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            !prev,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <Eye
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    setPasswordVisible(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            !prev,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="confirmPassword"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-confirm-password">
                                                        Confirm Password
                                                    </FieldLabel>
                                                    <div className="flex justify-center items-center gap-1">
                                                        <Input
                                                            type={
                                                                confirmPasswordVisible
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            {...field}
                                                            id="signup-form-confirm-password"
                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                            placeholder="Repeat Your Password"
                                                        />
                                                        {confirmPasswordVisible ? (
                                                            <EyeOff
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    setConfirmPasswordVisible(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            !prev,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <Eye
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    setConfirmPasswordVisible(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            !prev,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
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
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-number">
                                                        Mobile Number
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="signup-form-number"
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        placeholder="9876543210"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="state"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-state">
                                                        State
                                                    </FieldLabel>
                                                    <Select
                                                        defaultValue="Select Your State"
                                                        value={field.value}
                                                        onValueChange={(
                                                            selectedState,
                                                        ) => {
                                                            field.onChange(
                                                                selectedState,
                                                            );

                                                            const targetState =
                                                                statesList.find(
                                                                    (s) =>
                                                                        s.state_name_english ===
                                                                        selectedState,
                                                                );
                                                            if (targetState)
                                                                fetchDistricts(
                                                                    targetState.state_code,
                                                                );
                                                        }}
                                                        items={statesList.map(
                                                            (state) => ({
                                                                label: state.state_name_english.toLocaleUpperCase(),
                                                                value: state.state_name_english,
                                                            }),
                                                        )}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Your State" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    States
                                                                </SelectLabel>
                                                                {statesList.map(
                                                                    (state) => (
                                                                        <SelectItem
                                                                            key={
                                                                                state.state_code
                                                                            }
                                                                            value={
                                                                                state.state_name_english
                                                                            }
                                                                        >
                                                                            {state.state_name_english.toLocaleUpperCase()}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="district"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel htmlFor="signup-form-district">
                                                        District
                                                    </FieldLabel>
                                                    <Select
                                                        defaultValue="Select Your District"
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        items={districtsList.map(
                                                            (district) => ({
                                                                label: district.district_name_english.toLocaleUpperCase(),
                                                                value: district.district_name_english,
                                                            }),
                                                        )}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Your District" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    Districts
                                                                </SelectLabel>
                                                                {districtsList.map(
                                                                    (
                                                                        district,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                district.district_code
                                                                            }
                                                                            value={
                                                                                district.district_name_english
                                                                            }
                                                                        >
                                                                            {district.district_name_english.toLocaleUpperCase()}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        {/* Crop Preferences Multi-Select Checkboxes */}
                                        <Controller
                                            name="cropPreferences"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <FieldLabel>
                                                        Preferred Crops
                                                    </FieldLabel>
                                                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border rounded-md">
                                                        {cropsList.map(
                                                            (crop) => (
                                                                <label
                                                                    key={
                                                                        crop.value
                                                                    }
                                                                    className="flex items-center gap-2 text-sm cursor-pointer"
                                                                >
                                                                    <Checkbox
                                                                        checked={field.value?.includes(
                                                                            crop.value,
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) => {
                                                                            return checked
                                                                                ? field.onChange(
                                                                                      [
                                                                                          ...(field.value ||
                                                                                              []),
                                                                                          crop.value,
                                                                                      ],
                                                                                  )
                                                                                : field.onChange(
                                                                                      field.value?.filter(
                                                                                          (
                                                                                              v,
                                                                                          ) =>
                                                                                              v !==
                                                                                              crop.value,
                                                                                      ),
                                                                                  );
                                                                        }}
                                                                    />
                                                                    <span>
                                                                        {
                                                                            crop.value
                                                                        }
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                    <div className="text-white">
                                                        <span className="font-semibold">
                                                            Selected:
                                                        </span>{" "}
                                                        {field.value.join(", ")}
                                                    </div>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                    </>
                                )}
                            </FieldGroup>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 mt-3">
                        <div className="flex w-full gap-2">
                            {step === 2 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={isSubmitting}
                                    className="w-1/2 rounded-md"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                                </Button>
                            )}

                            {step === 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full flex items-center justify-center gap-2 rounded-md"
                                >
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    form="signup-form"
                                    disabled={isSubmitting}
                                    className="w-1/2 flex items-center justify-center gap-2 rounded-md"
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

                            <div className="relative w-full my-1 flex items-center justify-center">
                            <div className="border-t border-gray-300 w-full" />
                            <span className="bg-white px-2 text-xs text-gray-500 uppercase absolute">
                                Or
                            </span>
                        </div>

                        {/* Google Sign-Up Button */}
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
