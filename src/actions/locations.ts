"use server"

import { getCachedSession } from "@/lib/session"
import { db } from "@/lib/db"

export async function getLocations() {
  const session = await getCachedSession()

  if (!session) {
    return { error: "Non authentifié" }
  }

  try {
    const locations = await db.location.findMany({
      include: {
        commission: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return {
      success: true,
      locations
    }
  } catch (error) {
    console.error("Error fetching locations:", error)
    return { error: "Erreur lors de la récupération des lieux" }
  }
}
