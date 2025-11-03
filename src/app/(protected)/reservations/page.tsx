import { getMyReservations } from "@/actions/reservations"
import { ReservationsContent } from "@/features/reservations/reservations-content"
import {CalendarCheck, User} from "lucide-react"
import {PageHeader} from "@/components";
import {PageHeroSection} from "@/components/page-hero";

export const metadata = {
  title: "Mes Réservations - ESP Réservation",
  description: "Gérez vos réservations",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await getMyReservations({ searchParams: params })

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

  return (
      <div>
          <PageHeader/>
          <div className="flex-1 space-y-6 p-6">
              <PageHeroSection
                  icon={CalendarCheck}
                  title="Mes Réservations"
                  description="Consultez et gérez vos demandes"
                  visualIcon={CalendarCheck}
              />

              <ReservationsContent result={result}/>
          </div>
      </div>
  )
}
