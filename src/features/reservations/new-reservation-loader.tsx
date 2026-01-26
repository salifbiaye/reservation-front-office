import { db } from "@/lib/db"
import { NewReservationForm } from "./new-reservation-form"

export async function NewReservationLoader() {
  const locations = await db.location.findMany({
    include: {
      commission: true
    },
    orderBy: {
      name: "asc"
    }
  })

  return <NewReservationForm locations={locations} />
}
