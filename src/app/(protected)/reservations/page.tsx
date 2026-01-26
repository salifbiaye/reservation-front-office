import { ReservationsLoader } from "@/features/reservations/reservations-loader"
import { CalendarCheck } from "lucide-react"
import { PageHeader } from "@/components"
import { PageHeroSection } from "@/components/page-hero"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Mes Réservations - ESP Réservation",
  description: "Gérez vos réservations",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={CalendarCheck}
          title="Mes Réservations"
          description="Consultez et gérez vos demandes"
          visualIcon={CalendarCheck}
        />

        <Suspense fallback={<TableSkeleton />}>
          <ReservationsLoader searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
