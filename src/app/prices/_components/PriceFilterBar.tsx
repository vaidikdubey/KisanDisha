"use client";

import { toast } from "@/components/ui/toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

//ShadCn Components
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Commodity {
    id?: string;
    name?: string;
}

interface LocationItem {
    state?: string;
    district?: string;
}

export const PriceFilterBar = () => {
    const router = useRouter();
    const currentParams = useSearchParams();

    const today = startOfDay(new Date());
    const defaultFrom = subDays(today, 2);
    const defaultTo = subDays(today, 1);

    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [locations, setLocations] = useState<LocationItem[]>([]);

    const [selectedCommodity, setSelectedCommodity] = useState<string>(
        currentParams.get("commodity") ?? "",
    );
    const [selectedState, setSelectedState] = useState<string>(
        currentParams.get("state") ?? "",
    );
    const [selectedDistrict, setSelectedDistrict] = useState<string>(
        currentParams.get("district") ?? "",
    );
    const [date, setDate] = useState<DateRange | undefined>(() => {
        const paramStart = currentParams.get("startDate");
        const paramEnd = currentParams.get("endDate");

        const fromDate = paramStart ? new Date(paramStart) : defaultFrom;
        const validFrom = !isNaN(fromDate.getTime()) ? fromDate : defaultFrom;

        const toDate = paramEnd ? new Date(paramEnd) : defaultTo;
        const validTo = !isNaN(toDate.getTime()) ? toDate : defaultTo;

        return {
            from: validFrom,
            to: validTo,
        };
    });

    const getCommodities = useCallback(async () => {
        try {
            const response = await axios.get<ApiResponse>(`/api/commodities`);

            if (response.data.success && Array.isArray(response.data.data))
                setCommodities(response.data.data);
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

    const getStatesAndDistricts = useCallback(async () => {
        try {
            const response = await axios.get<ApiResponse>("/api/locations");

            if (response.data.success && Array.isArray(response.data.data)) {
                setLocations(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching locations ", error);
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage =
                axiosError.response?.data.error || "Error fetching locations";

            toast.add({
                title: "Error",
                description: errorMessage,
                type: "error",
            });
        }
    }, []);

    useEffect(() => {
        //eslint-disable-next-line
        getCommodities();
        getStatesAndDistricts();
    }, [getCommodities, getStatesAndDistricts]);

    const stateList = useMemo(() => {
        return Array.from(new Set(locations.map((item) => item.state)));
    }, [locations]);

    const districtsList = useMemo(() => {
        if (!selectedState) return [];

        return locations
            .filter((item) => item.state === selectedState)
            .map((item) => item.district);
    }, [locations, selectedState]);

    function searchPrices() {
        const params = new URLSearchParams();

        if (selectedCommodity) params.set("commodity", selectedCommodity);
        if (selectedState) params.set("state", selectedState);
        if (selectedDistrict) params.set("district", selectedDistrict);
        if (date?.from) params.set("startDate", date.from.toString());
        if (date?.to) params.set("endDate", date.to.toString());

        //Resetting to page 1 on any filter change
        params.set("page", "1");

        router.replace(`/prices?${params.toString()}`);
    }

    return (
        <div className="w-full flex flex-col">
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2 justify-between items-center p-5 px-8">
                {/* Commodities */}
                <Select
                    defaultValue="Select Commodity"
                    value={selectedCommodity}
                    onValueChange={(value) => setSelectedCommodity(value!)}
                    items={commodities.map((c) => ({
                        label: c.name?.toLocaleUpperCase(),
                        value: c.name,
                    }))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Commodity" />
                    </SelectTrigger>
                    <SelectContent className="w-fit">
                        <SelectGroup>
                            <SelectLabel>Commodities</SelectLabel>
                            {commodities.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                    {c.name?.toLocaleUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* State */}
                <Select
                    defaultValue="Select State"
                    value={selectedState}
                    onValueChange={(value) => setSelectedState(value!)}
                    items={stateList.map((s) => ({
                        label: s?.toLocaleUpperCase(),
                        value: s,
                    }))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="w-fit">
                        <SelectGroup>
                            <SelectLabel>Select State</SelectLabel>
                            {stateList.map((s, idx) => (
                                <SelectItem key={idx} value={s}>
                                    {s?.toLocaleUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* District */}
                <Select
                    defaultValue="Select District"
                    value={selectedDistrict}
                    onValueChange={(value) => setSelectedDistrict(value!)}
                    items={districtsList.map((s) => ({
                        label: s?.toLocaleUpperCase(),
                        value: s,
                    }))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="w-fit">
                        <SelectGroup>
                            <SelectLabel>Select District</SelectLabel>
                            {districtsList.length > 0 ? (
                                districtsList.map((d, idx) => (
                                    <SelectItem key={idx} value={d}>
                                        {d?.toLocaleUpperCase()}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem key={1} disabled>
                                    Please select a state first
                                </SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* Start and End Date */}
                <Field className="flex flex-row w-full">
                    <Popover>
                        <PopoverTrigger
                            render={
                                <Button
                                    variant="outline"
                                    id="date-picker-range"
                                    className="w-full justify-start px-2.5 font-normal min-w-0 h-auto py-2 whitespace-normal"
                                >
                                    <CalendarIcon
                                        data-icon="inline-start"
                                        className="shrink-0 mr-0 self-center"
                                    />
                                    {date?.from ? (
                                        date.to ? (
                                            <span className="flex flex-wrap items-center gap-x-1 text-xs md:text-sm leading-tight">
                                                <span>
                                                    {format(
                                                        date.from,
                                                        "LLL dd, y",
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    -
                                                </span>
                                                <span>
                                                    {format(
                                                        date.to,
                                                        "LLL dd, y",
                                                    )}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-xs md:text-sm">
                                                {format(date.from, "LLL dd, y")}
                                            </span>
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </Field>
            </div>

            <Button
                onClick={searchPrices}
                variant="link"
                className="w-fit mx-auto"
            >
                Get Prices
            </Button>
        </div>
    );
};
