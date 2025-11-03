"use client"

import { MapPin } from "lucide-react"
import { Pie, PieChart } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface LocationChartProps {
    data: Array<{
        name: string
        count: number
        color: string
    }>
}

// Couleurs prédéfinies du thème
const THEME_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]

export function LocationChart({ data }: LocationChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Aucune réservation pour le moment</p>
            </div>
        )
    }

    // Créer la config dynamiquement avec les couleurs du thème
    const chartConfig = data.reduce((acc, item, index) => {
        const colorKey = `location${index}`
        acc[colorKey] = {
            label: item.name,
            color: THEME_COLORS[index % THEME_COLORS.length],
        }
        return acc
    }, {
        count: {
            label: "Réservations",
        },
    } as ChartConfig)

    // Formater les données pour le PieChart avec les couleurs du thème
    const chartData = data.map((item, index) => ({
        location: item.name,
        count: item.count,
        fill: THEME_COLORS[index % THEME_COLORS.length],
    }))

    // Calculer le total
    const totalReservations = data.reduce((sum, item) => sum + item.count, 0)

    // Trouver le lieu le plus réservé
    const topLocation = data[0]
    const topPercentage = ((topLocation.count / totalReservations) * 100).toFixed(0)

    return (
        <div className="space-y-4">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="location"
                        stroke="0"
                    />
                </PieChart>
            </ChartContainer>

            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                        {topLocation.name} est votre favori ({topPercentage}%)
                    </span>
                </div>
                <div className="text-muted-foreground leading-none">
                    Répartition de vos {totalReservations} réservation{totalReservations > 1 ? 's' : ''}
                </div>
            </div>
        </div>
    )
}