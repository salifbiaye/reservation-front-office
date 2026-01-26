import { getCachedSession } from "@/lib/session"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, MapPin, Activity } from "lucide-react"
import {
  getStudentStats,
  getMonthlyReservations,
  getLocationStats,
  getUpcomingReservations
} from "@/actions/stats"
import { StatsCard } from "./stats-card"
import { MonthlyChart } from "./monthly-charts"
import { LocationChart } from "./location-charts"
import { UpcomingList } from "./upcoming-list"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export async function DashboardLoader() {
  const session = await getCachedSession()

  // Récupérer toutes les données en parallèle
  const [stats, monthlyData, locationData, upcomingReservations] = await Promise.all([
    getStudentStats(),
    getMonthlyReservations(),
    getLocationStats(),
    getUpcomingReservations(),
  ])

  const statsConfig = [
    {
      title: "Total réservations",
      value: stats.total,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Toutes vos réservations"
    },
    {
      title: "Acceptées",
      value: stats.accepted,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Réservations validées"
    },
    {
      title: "En attente",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "En cours de validation"
    },
    {
      title: "Refusées",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Réservations rejetées"
    },
  ]

  const acceptanceRate = stats.total > 0
    ? Math.round((stats.accepted / stats.total) * 100)
    : 0

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>
              Vos réservations sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Lieux favoris
            </CardTitle>
            <CardDescription>
              Top 5 de vos lieux les plus réservés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationChart data={locationData} />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations & Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Prochaines réservations
            </CardTitle>
            <CardDescription>
              Vos réservations acceptées à venir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingList reservations={upcomingReservations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Performance
            </CardTitle>
            <CardDescription>
              Vos statistiques clés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Taux d'acceptation</span>
                <span className="text-2xl font-bold text-green-600">{acceptanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${acceptanceRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Réservations actives</span>
                <Badge variant="default">{stats.accepted + stats.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">En attente</span>
                <Badge variant="secondary">{stats.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Annulées</span>
                <Badge variant="outline">{stats.cancelled}</Badge>
              </div>
            </div>

            {stats.total > 0 && session && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Membre depuis {format(new Date(session.user.createdAt), "MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
