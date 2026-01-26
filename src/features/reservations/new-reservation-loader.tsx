import { getLocations } from "@/actions/locations"
import { NewReservationForm } from "./new-reservation-form"

export async function NewReservationLoader() {
  const result = await getLocations()

  if ("error" in result) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
        Erreur: {result.error}
      </div>
    )
  }

  return <NewReservationForm locations={result.locations} />
}
