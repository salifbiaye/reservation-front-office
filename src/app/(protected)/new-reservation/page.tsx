import { db } from "@/lib/db"
import { NewReservationForm } from "@/features/reservations/new-reservation-form"
import {PageHeroSection} from "@/components/page-hero";
import {CalendarCheck, EditIcon} from "lucide-react";
import {PageHeader} from "@/components";

export const metadata = {
  title: "Nouvelle Demande - ESP Réservation",
  description: "Demander une nouvelle réservation",
}

export default async function NewReservationPage() {
  const locations = await db.location.findMany({
    include: {
      commission: true
    },
    orderBy: {
      name: "asc"
    }
  })

  return (
      <>
        <PageHeader/>
        <div className="flex-1 space-y-6 p-6">
          <PageHeroSection
              icon={EditIcon}
              title="Nouvelle Demande de Réservation"
              description="Remplissez le formulaire pour demander une réservation"
              visualIcon={EditIcon}
          />
          <NewReservationForm locations={locations}/>
        </div>
      </>
  )
}
