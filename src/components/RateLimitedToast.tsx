"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";

export function RateLimitToast() {
    useEffect(() => {
        toast.add({
            title: "Error",
            description: "You're sending requests too quickly. Please wait a moment.",
            type: "error",
        });
    }, []);

    return null;
}