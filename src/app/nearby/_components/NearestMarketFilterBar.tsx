"use client";

import { toast } from "@/components/ui/toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

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
import { CalendarIcon, Search } from "lucide-react";

export interface Commodity {
  id?: string;
  name?: string;
}

export interface LocationItem {
  state?: string;
  district?: string;
}

export const NearestMarketFilterBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const [selectedCommodity, setSelectedCommodity] = useState<string>(
    currentParams.get("commodity") ?? ""
  );
  const [selectedState, setSelectedState] = useState<string>(
    currentParams.get("state") ?? ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    currentParams.get("district") ?? ""
  );
  const [date, setDate] = useState<Date | undefined>(() => {
    const paramDate = currentParams.get("date");
    if (!paramDate) return undefined;
    const parsed = new Date(paramDate);
    return !isNaN(parsed.getTime()) ? parsed : undefined;
  });

  const getCommodities = useCallback(async () => {
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
    return Array.from(
      new Set(
        locations
          .map((item) => item.state)
          .filter((state): state is string => Boolean(state))
      )
    );
  }, [locations]);

  const districtsList = useMemo(() => {
    if (!selectedState) return [];

    return Array.from(
      new Set(
        locations
          .filter((item) => item.state === selectedState)
          .map((item) => item.district)
          .filter((district): district is string => Boolean(district))
      )
    );
  }, [locations, selectedState]);

  function searchPrices() {
    if (!selectedCommodity) {
      toast.add({
        title: "Validation Error",
        description: "Please select a commodity.",
        type: "error",
      });
      return;
    }

    const params = new URLSearchParams();

    if (selectedCommodity) params.set("commodity", selectedCommodity);
    if (selectedState) params.set("state", selectedState);
    if (selectedDistrict) params.set("district", selectedDistrict);
    if (date) params.set("date", format(date, "yyyy-MM-dd"));

    // Resetting to page 1 on any search change
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Commodities Dropdown */}
        <Select
          value={selectedCommodity}
          onValueChange={(value) => setSelectedCommodity(value!)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Commodity" />
          </SelectTrigger>
          <SelectContent className="w-fit">
            <SelectGroup>
              <SelectLabel>Commodities</SelectLabel>
              {commodities.map((c) => (
                <SelectItem key={c.id || c.name} value={c.name || ""}>
                  {c.name?.toLocaleUpperCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* State Dropdown */}
        <Select
          value={selectedState}
          onValueChange={(value) => {
            setSelectedState(value!);
            setSelectedDistrict(""); // Clear district when state changes
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="w-fit">
            <SelectGroup>
              <SelectLabel>Select State</SelectLabel>
              {stateList.map((s, idx) => (
                <SelectItem key={idx} value={s}>
                  {s.toLocaleUpperCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* District Dropdown */}
        <Select
          value={selectedDistrict}
          onValueChange={(value) => setSelectedDistrict(value!)}
          disabled={!selectedState}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                selectedState ? "Select District" : "Select State First"
              }
            />
          </SelectTrigger>
          <SelectContent className="w-fit">
            <SelectGroup>
              <SelectLabel>Select District</SelectLabel>
              {districtsList.length > 0 ? (
                districtsList.map((d, idx) => (
                  <SelectItem key={idx} value={d}>
                    {d.toLocaleUpperCase()}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Please select a state first
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Date Selector */}
        <Field className="flex flex-row w-full">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id="date-picker-single"
                  className="w-full justify-start px-2.5 font-normal min-w-0 h-10 py-2 whitespace-normal"
                >
                  <CalendarIcon className="shrink-0 mr-2 h-4 w-4" />
                  {date ? (
                    <span className="text-xs md:text-sm">
                      {format(date, "LLL dd, y")}
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Default (Today)
                    </span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
              />
            </PopoverContent>
          </Popover>
        </Field>
      </div>

      <Button
        onClick={searchPrices}
        className="w-full sm:w-auto sm:px-8 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
      >
        <Search className="w-4 h-4 mr-2" />
        Get Nearest Prices
      </Button>
    </div>
  );
};