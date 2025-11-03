import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: number
    icon: LucideIcon
    color: string
    bgColor: string
    description?: string
}

export function StatsCard({ title, value, icon: Icon, color, bgColor, description }: StatsCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`p-2 rounded-full ${bgColor}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}