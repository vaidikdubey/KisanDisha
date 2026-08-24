'use client'

import { toast } from "@/components/ui/toast"
import { onboardingSchema } from "@/schemas/onboardingSchema";
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { StateRecord } from "@/types/States"
import { DistrictRecord } from "@/types/Districts"
import gsap from "gsap"

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
import { Loader2 } from "lucide-react";

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

const OnboardingPage = () => {
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statesList, setStatesList] = useState<StateRecord[]>([]);
    const [districtsList, setDistrictsList] = useState<DistrictRecord[]>([]);

    const form = useForm<z.infer<typeof onboardingSchema>>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            mobileNumber: "",
            state: "",
            district: "",
            cropPreferences: [],
        },
    });

    const onSubmit = async (data: z.infer<typeof onboardingSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await axios.post<ApiResponse>(
                "/api/user/onboarding",
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
            console.error("Error onboarding user", error);
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.error || "Error onboarding.";

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
                            <CardTitle>Complete your profile</CardTitle>
                        </div>
                        <CardDescription>
                            Just a few details to personalize your prices and advisor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            id="signup-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FieldGroup>
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
                                            Submitting...
                                        </>
                                    ) : (
                                        "Get Started"
                                    )}
                                </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
export default OnboardingPage