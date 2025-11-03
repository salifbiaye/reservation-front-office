"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"

interface MonthlyChartProps {
    data: Array<{
        month: string
        total: number
        accepted: number
        rejected: number
        pending: number
    }>
}

const chartConfig = {
    accepted: {
        label: "Acceptées",
        color: "var(--chart-2)",
    },
    pending: {
        label: "En attente",
        color: "var(--chart-4)",
    },
    rejected: {
        label: "Refusées",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function MonthlyChart({ data }: MonthlyChartProps) {
    if (data.length === 0 || data.every(d => d.total === 0)) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Aucune donnée disponible</p>
            </div>
        )
    }

    // Calculer la tendance (comparer dernier mois vs mois précédent)
    const lastMonth = data[data.length - 1]
    const previousMonth = data[data.length - 2]
    const trend = previousMonth
        ? ((lastMonth.total - previousMonth.total) / (previousMonth.total || 1)) * 100
        : 0
    const isPositiveTrend = trend >= 0

    return (
        <div className="space-y-4">
            <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                        dataKey="accepted"
                        fill="var(--color-accepted)"
                        radius={4}
                        stackId="a"
                    />
                    <Bar
                        dataKey="pending"
                        fill="var(--color-pending)"
                        radius={4}
                        stackId="a"
                    />
                    <Bar
                        dataKey="rejected"
                        fill="var(--color-rejected)"
                        radius={4}
                        stackId="a"
                    />
                </BarChart>
            </ChartContainer>

            <div className="flex flex-col gap-2 text-sm">
                {lastMonth.total > 0 && previousMonth && (
                    <div className="flex gap-2 leading-none font-medium">
                        {isPositiveTrend ? (
                            <>
                                <span className="text-green-600 dark:text-green-400">
                                    +{Math.abs(trend).toFixed(1)}% ce mois
                                </span>
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </>
                        ) : (
                            <>
                                <span className="text-red-600 dark:text-red-400">
                                    {trend.toFixed(1)}% ce mois
                                </span>
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </>
                        )}
                    </div>
                )}
                <div className="text-muted-foreground leading-none">
                    {lastMonth.total} réservation{lastMonth.total > 1 ? 's' : ''} ce mois ({lastMonth.accepted} acceptée{lastMonth.accepted > 1 ? 's' : ''})
                </div>
            </div>
        </div>
    )
}