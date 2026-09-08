import { prisma } from "../prisma";

export async function getPrices(params: {
    commodity: string; state: string; district: string; startDate: string; endDate: string; page?: string, limit?: string
}) { 
    const commodityRecord = await prisma.commodity.findUnique({
        where: {
            
        }
    })
}