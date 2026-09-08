import { CommodityNotFoundError, getPrices } from "@/lib/queries/prices";
import { PriceFilterBar } from "./_components/PriceFilterBar";

export default async function PricesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const params = await searchParams

    if (!params.commodity) return (
        <div className="h-full w-full flex flex-col justify-center items-center">
            <PriceFilterBar />
            <p className="h-full flex-1">Select a commodity to see prices.</p>
        </div>
    )

    let data: Awaited<ReturnType<typeof getPrices>> | null = null;
    let commodityMissing = false;

    try {
        data = await getPrices({
            commodity: params.commodity,
            state: params.state,
            district: params.district,
            startDate: params.startDate,
            endDate: params.endDate,
            page: Number(params.page) || 1,
            limit: Number(params.limit) || 20
        })
    } catch (error) {
        if (error instanceof CommodityNotFoundError) { 
            commodityMissing = true
        }
        throw error
    }

    if (commodityMissing) return (
        <div>
            <PriceFilterBar />
            <p>Commodity not found.</p>
        </div>
    )

    const { prices, total, limit, page } = data

    return (
        <div>
            <PriceFilterBar />
            
        </div>
    )
}