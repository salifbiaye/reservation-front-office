import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Reservation {
    id: string
    title: string
    start: Date
    end: Date
    location: {
        name: string
        color: string
    }
}

interface UpcomingListProps {
    reservations: Reservation[]
}

export function UpcomingList({ reservations }: UpcomingListProps) {
    if (reservations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-2 opacity-50" />
                <p>Aucune réservation à venir</p>
                <p className="text-sm">Créez votre première réservation !</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {reservations.map((reservation) => (
                <div
                    key={reservation.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                    <div
                        className="w-1 h-full rounded-full"
                        style={{ backgroundColor: reservation.location.color }}
                    />
                    <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                            <h4 className="font-medium line-clamp-1">{reservation.title}</h4>
                            <Badge variant="outline" className="ml-2">
                                {format(reservation.start, "d MMM", { locale: fr })}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{reservation.location.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                  {format(reservation.start, "HH:mm", { locale: fr })} - {format(reservation.end, "HH:mm", { locale: fr })}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}