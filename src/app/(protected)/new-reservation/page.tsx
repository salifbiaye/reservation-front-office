import { NewReservationLoader } from "@/features/reservations/new-reservation-loader"
import { PageHeroSection } from "@/components/page-hero"
import { EditIcon } from "lucide-react"
import { PageHeader } from "@/components"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Nouvelle Demande - ESP Réservation",
  description: "Demander une nouvelle réservation",
}

export default function NewReservationPage() {
  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={EditIcon}
          title="Nouvelle Demande de Réservation"
          description="Remplissez le formulaire pour demander une réservation"
          visualIcon={EditIcon}
        />
        <Suspense fallback={<FormSkeleton />}>
          <NewReservationLoader />
        </Suspense>
      </div>
    </>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
