"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/toast";
import { ApiResponse } from "@/types/ApiResponse";
import { updateProfileSchema } from "@/schemas/updateProfileSchema";
import {
    Commodity,
    LocationItem,
} from "@/app/nearby/_components/NearestMarketFilterBar";
import { cn } from "cn";

// ShadCn Components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
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

import {
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Sprout,
    ShieldCheck,
    Key,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Sparkles,
    Save,
    AlertTriangle,
    Eye,
    EyeOff,
    Copy,
} from "lucide-react";

type ProfileFormValues = z.infer<typeof updateProfileSchema>;

type UserProfile = {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string | null;
    provider: string;
    emailVerified?: Date | null;
    state?: string | null;
    district?: string | null;
    cropPreferences: string[];
    createdAt?: Date;
};

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile>({
        id: "",
        name: "",
        email: "",
        mobileNumber: "",
        provider: "", // 'CREDENTIALS' | 'GOOGLE'
        emailVerified: null,
        state: "",
        district: "",
        cropPreferences: [""],
        createdAt: undefined,
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showCurrentPassword, setShowCurrentPassword] =
        useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [viewId, setViewId] = useState<boolean>(false);

    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [commodities, setCommodities] = useState<Commodity[]>([]);

    const isVerified = Boolean(user.emailVerified);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user.name,
            email: "",
            mobileNumber: user.mobileNumber || "",
            state: user.state || "",
            district: user.district || "",
            cropPreferences: user.cropPreferences || [],
            currentPassword: "",
            newPassword: "",
        },
    });

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await axios.get("/api/profile");

            if (response.data.success) {
                setUser((prevUser): UserProfile => ({
                    ...prevUser,
                    id: response.data.data.id ?? prevUser.id,
                    name: response.data.data.name ?? prevUser.name,
                    email: response.data.data.email ?? prevUser.email,
                    mobileNumber:
                        response.data.data.mobileNumber ??
                        prevUser.mobileNumber,
                    provider: response.data.data.provider ?? prevUser.provider,
                    emailVerified: response.data.data.emailVerified
                        ? new Date(response.data.data.emailVerified)
                        : prevUser.emailVerified,
                    state: response.data.data.state ?? prevUser.state,
                    district: response.data.data.district ?? prevUser.district,
                    cropPreferences:
                        response.data.data.cropPreferences ??
                        prevUser.cropPreferences,
                    createdAt: response.data.data.createdAt
                        ? new Date(response.data.data.createdAt)
                        : prevUser.createdAt,
                }));

                const responseData = response.data.data;

                if (responseData.name) setValue("name", responseData.name);

                if (responseData.email) setValue("email", responseData.email);

                if (responseData.mobileNumber)
                    setValue("mobileNumber", responseData.mobileNumber);

                if (responseData.cropPreferences)
                    setValue("cropPreferences", responseData.cropPreferences);

                if (responseData.state)
                    setValue("state", response.data.data.state);

                if (responseData.district)
                    setValue("district", response.data.data.district);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.error ||
                "Error fetching user profile";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        }
    }, []);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const selectedState = watch("state");

    const selectedCrops = watch("cropPreferences");

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await axios.patch<ApiResponse>("/api/profile", data);

            if (response.data.success) {
                setUser((prev) => ({ ...prev, ...data }));
                reset({
                    name: data.name,
                    mobileNumber: data.mobileNumber,
                    state: data.state,
                    district: data.district,
                    cropPreferences: data.cropPreferences,
                    currentPassword: "",
                    newPassword: "",
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.add({
                title: "Error",
                description:
                    axiosError.response?.data?.error ||
                    "Failed to update profile",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIdCopy = () => {
        if (!user.id || user.id.trim() === "") return;

        navigator.clipboard.writeText(user.id);
        toast.add({
            title: "Success",
            description: "UserID copied to clipboard",
            type: "success",
        });
    };

    const fetchCommodities = useCallback(async () => {
        try {
            const response = await axios.get<ApiResponse>(`/api/commodities`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setCommodities(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching commodities ", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage =
                axiosError.response?.data.error || "Error fetching commodities";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        }
    }, []);

    const fetchLocations = useCallback(async () => {
        try {
            const response = await axios.get<ApiResponse>("/api/locations");

            if (response.data.success && Array.isArray(response.data.data))
                setLocations(response.data.data);
        } catch (error) {
            console.error("Error fetching locations ", error);

            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.message || "Error fetching locations";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        }
    }, []);

    useEffect(() => {
        fetchLocations();
        fetchCommodities();
    }, [fetchLocations, fetchCommodities]);

    const statesList = useMemo(() => {
        return Array.from(
            new Set(
                locations
                    .map((item) => item.state)
                    .filter((state): state is string => Boolean(state)),
            ),
        );
    }, [locations]);

    const districtsList = useMemo(() => {
        if (!selectedState) return [];

        return Array.from(
            new Set(
                locations
                    .filter((item) => item.state === selectedState)
                    .map((item) => item.district)
                    .filter((district): district is string =>
                        Boolean(district),
                    ),
            ),
        );
    }, [locations, selectedState]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
            {!isVerified && (
                <Card className="border-amber-500/40 bg-amber-500/10 backdrop-blur-md text-amber-900 dark:text-amber-200">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                    Email Action Required
                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                        UNVERIFIED
                                    </span>
                                </h3>
                                <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                                    Your address{" "}
                                    <span className="font-mono font-medium">
                                        {user.email}
                                    </span>{" "}
                                    is unverified. Verify your email for added
                                    account security.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/home/profile/verify"
                            className="flex items-center"
                        >
                            <Button
                                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shrink-0 flex"
                                size="sm"
                            >
                                Verify Email
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            <Card className="border-border/80 bg-background/60 backdrop-blur-md relative overflow-hidden">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <CardContent className="p-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold font-mono shrink-0 shadow-inner">
                            {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                                    {user.name}
                                </h1>
                                {isVerified ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                        <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                        Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                        Pending Verification
                                    </span>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 font-mono">
                                <Mail className="h-3.5 w-3.5" />
                                {user.email}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                                <span className="font-mono bg-muted/60 px-2 py-0.5 rounded border border-border/60">
                                    Provider: {user.provider}
                                </span>
                                <span>•</span>
                                <span>
                                    Member since{" "}
                                    {user.createdAt &&
                                        user.createdAt.toLocaleDateString(
                                            "en-IN",
                                            {
                                                month: "short",
                                                year: "numeric",
                                            },
                                        )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border/60 text-xs font-mono text-muted-foreground gap-2">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            KisanDisha Profile
                        </span>
                        <span className="flex justify-center items-center gap-1">
                            {viewId ? (
                                <span>ID: {user.id}</span>
                            ) : (
                                <span>ID: ∗∗∗∗-∗∗∗∗-∗∗∗∗-∗∗∗∗</span>
                            )}
                            {viewId ? (
                                <Eye
                                    onClick={() => setViewId((prev) => !prev)}
                                    size={15}
                                />
                            ) : (
                                <EyeOff
                                    onClick={() => setViewId((prev) => !prev)}
                                    size={15}
                                />
                            )}
                            <Copy onClick={handleIdCopy} size={15} />
                        </span>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT SECTION: Location & Crop Preferences */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Regional / Location Context */}
                        <Card className="border-border/80 bg-background/60 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-emerald-500" />
                                    Regional Location Settings
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Sets default scope for market search
                                    calculations across KisanDisha.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* State Field */}
                                    <Field>
                                        <FieldLabel className="text-xs">
                                            Primary State
                                        </FieldLabel>
                                        <Controller
                                            name="state"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <Select
                                                        defaultValue="Select Your State"
                                                        value={field.value}
                                                        onValueChange={(
                                                            selectedState,
                                                        ) => {
                                                            field.onChange(
                                                                selectedState,
                                                            );
                                                            setValue(
                                                                "district",
                                                                "",
                                                            );
                                                        }}
                                                        items={statesList.map(
                                                            (state) => ({
                                                                label: state,
                                                                value: state,
                                                            }),
                                                        )}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Your State" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {statesList.map(
                                                                    (
                                                                        state,
                                                                        idx,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                idx
                                                                            }
                                                                            value={
                                                                                state
                                                                            }
                                                                        >
                                                                            {
                                                                                state
                                                                            }
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
                                        {errors.state && (
                                            <FieldError>
                                                {errors.state.message}
                                            </FieldError>
                                        )}
                                    </Field>

                                    {/* District Field */}
                                    <Field>
                                        <FieldLabel className="text-xs">
                                            Primary District / Mandi Hub
                                        </FieldLabel>
                                        <Controller
                                            name="district"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                >
                                                    <Select
                                                        defaultValue="Select Your District"
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        items={districtsList.map(
                                                            (district) => ({
                                                                label: district,
                                                                value: district,
                                                            }),
                                                        )}
                                                        disabled={
                                                            !selectedState
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue
                                                                placeholder={
                                                                    selectedState
                                                                        ? "Select Your District"
                                                                        : "Select State First"
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>
                                                                    Districts
                                                                </SelectLabel>
                                                                {districtsList.map(
                                                                    (
                                                                        district,
                                                                        idx,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                idx
                                                                            }
                                                                            value={
                                                                                district
                                                                            }
                                                                        >
                                                                            {
                                                                                district
                                                                            }
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
                                        {errors.district && (
                                            <FieldError>
                                                {errors.district.message}
                                            </FieldError>
                                        )}
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Crop Preferences Selection */}
                        <Card className="border-border/80 bg-background/60 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Sprout className="h-5 w-5 text-emerald-500" />
                                        Crop Preferences
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Pre-filters commodity prices and tailors
                                        AI selling recommendation context.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="h-full pt-4 max-h-[51vh] overflow-y-auto">
                                <Controller
                                    name="cropPreferences"
                                    control={control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {commodities.map((crop) => {
                                                    const checked =
                                                        field.value?.includes(
                                                            crop.name!,
                                                        );
                                                    return (
                                                        <label
                                                            key={crop.id}
                                                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer text-xs ${
                                                                checked
                                                                    ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-medium"
                                                                    : "bg-background/80 border-border/80 text-muted-foreground hover:bg-muted/40"
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    checked
                                                                }
                                                                onCheckedChange={(
                                                                    isChecked,
                                                                ) => {
                                                                    if (
                                                                        isChecked
                                                                    ) {
                                                                        field.onChange(
                                                                            [
                                                                                ...(field.value ||
                                                                                    []),
                                                                                crop.name,
                                                                            ],
                                                                        );
                                                                    } else {
                                                                        field.onChange(
                                                                            field.value?.filter(
                                                                                (
                                                                                    val,
                                                                                ) =>
                                                                                    val !==
                                                                                    crop.name,
                                                                            ),
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <span>
                                                                {crop.name}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </FieldGroup>
                                            {errors.cropPreferences && (
                                                <FieldError>
                                                    {
                                                        errors.cropPreferences
                                                            .message
                                                    }
                                                </FieldError>
                                            )}
                                        </Field>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                Current Selection:{" "}
                                {[
                                    ...selectedCrops
                                        .sort((a: string, b: string) =>
                                            a.localeCompare(b),
                                        )
                                        .join(", "),
                                ]}
                            </CardFooter>
                        </Card>
                    </div>

                    {/* RIGHT SECTION: Account & Security Details */}
                    <div className="space-y-6">
                        {/* Contact Details */}
                        <Card className="border-border/80 bg-background/60 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-emerald-500" />
                                    Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <FieldGroup className="space-y-3">
                                    <Field>
                                        <FieldLabel className="text-xs">
                                            Full Name
                                        </FieldLabel>
                                        <Input
                                            {...register("name")}
                                            className="bg-background/80"
                                            placeholder="Your Full Name"
                                        />
                                        {errors.name && (
                                            <FieldError>
                                                {errors.name.message}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel className="text-xs">
                                            Email Address
                                        </FieldLabel>
                                        <Input
                                            value={user.email}
                                            disabled={
                                                user.provider !== "CREDENTIALS"
                                            }
                                            className={cn(
                                                "bg-background font-mono text-xs",
                                                user.provider !==
                                                    "CREDENTIALS" &&
                                                    "bg-muted/60 text-muted-foreground cursor-not-allowed",
                                            )}
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel className="text-xs">
                                            Mobile Number
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...register("mobileNumber")}
                                                placeholder="+91 00000 00000"
                                                className="pl-9 bg-background/80 font-mono text-xs"
                                            />
                                            <Phone className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
                                        </div>
                                        {errors.mobileNumber && (
                                            <FieldError>
                                                {errors.mobileNumber.message}
                                            </FieldError>
                                        )}
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Security Settings & Conditional Password Update */}
                        <Card className="border-border/80 bg-background/60 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    Security Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {user.provider === "CREDENTIALS" ? (
                                    <FieldGroup className="space-y-3">
                                        <Field>
                                            <FieldLabel className="text-xs">
                                                Current Password
                                            </FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    {...register(
                                                        "currentPassword",
                                                    )}
                                                    type={
                                                        showCurrentPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    placeholder="••••••••"
                                                    className="pr-9 bg-background/80 text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowCurrentPassword(
                                                            !showCurrentPassword,
                                                        )
                                                    }
                                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.currentPassword && (
                                                <FieldError>
                                                    {
                                                        errors.currentPassword
                                                            .message
                                                    }
                                                </FieldError>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel className="text-xs">
                                                New Password
                                            </FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    {...register("newPassword")}
                                                    type={
                                                        showNewPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    placeholder="••••••••"
                                                    className="pr-9 bg-background/80 text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword,
                                                        )
                                                    }
                                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.newPassword && (
                                                <FieldError>
                                                    {errors.newPassword.message}
                                                </FieldError>
                                            )}
                                        </Field>
                                    </FieldGroup>
                                ) : (
                                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                                            <Key className="h-3.5 w-3.5 text-emerald-500" />
                                            Managed via OAuth ({user.provider})
                                        </p>
                                        <p>
                                            Your account is authenticated via{" "}
                                            {user.provider}. Password updates
                                            are disabled.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <p className="text-xs text-muted-foreground hidden sm:block font-mono">
                        Created:{" "}
                        {user.createdAt && user.createdAt.toLocaleDateString()}
                    </p>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
