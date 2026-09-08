'use client'

import { pricesFormSchema } from "@/schemas/pricesFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod"

const PricesFormPage = () => {
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statesList, setStatesList] = useState<[]>([]);
    const [districtsList, setDistrictsList] = useState<[]>([]);

    const form = useForm<z.infer<typeof pricesFormSchema>>({
        resolver: zodResolver(pricesFormSchema),
        defaultValues: {
            commodity: "",
            district: "",
            state: "",
        }
    })

    function getPresentRange(days: number) { 
        const endDate = new Date()
        const startDate = new Date()

        startDate.setDate(startDate.getDate() - days)

        return {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0]
        }
    }

    const onSubmit = async (data: z.infer<typeof pricesFormSchema>) => { 
        setIsSubmitting(true)

        try {
            const response = await axios.post()
        } catch (error) {
            
        }
    }

  return (
    <div>PricesFormPage</div>
  )
}
export default PricesFormPage