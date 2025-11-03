"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { createReservationSchema, type CreateReservationInput } from "@/schemas/reservation"
import {
  parsePaginationParams,
  getPaginationSkipTake,
  buildPaginatedResult,
} from "@/lib/pagination"
import { buildSearchCondition, parseSearchParam, parseStatusFilter } from "@/lib/filters"

export async function getMyReservations(params?: {
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  const pagination = params?.searchParams
    ? parsePaginationParams(params.searchParams, { limit: 10 })
    : { page: 1, limit: 10 }

  const search = params?.searchParams ? parseSearchParam(params.searchParams, "search") : null
  const status = params?.searchParams ? parseStatusFilter(params.searchParams) : null

  const searchWhere = search ? buildSearchCondition(search, ["title", "description"]) : undefined
  const statusWhere = status ? { status } : undefined

  const where = {
    userId: session.user.id,
    AND: [searchWhere, statusWhere].filter(Boolean)
  }

  const { skip, take } = getPaginationSkipTake(pagination)
  const total = await db.reservation.count({ where })

  const reservations = await db.reservation.findMany({
    where,
    include: {
      location: {
        include: {
          commission: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take,
  })

  return buildPaginatedResult(reservations, total, pagination)
}

export async function createReservation(data: CreateReservationInput) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { success: false, error: "Non authentifié" }
  }

  const validated = createReservationSchema.parse(data)

  const location = await db.location.findUnique({
    where: { id: validated.locationId },
    include: {
      commission: {
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!location) {
    return { success: false, error: "Lieu introuvable" }
  }

  // Vérifier durée max
  if (location.maxDurationHours) {
    const durationHours = (validated.end.getTime() - validated.start.getTime()) / (1000 * 60 * 60)
    if (durationHours > location.maxDurationHours) {
      return {
        success: false,
        error: `Durée max: ${location.maxDurationHours}h (demandé: ${Math.round(durationHours * 10) / 10}h)`
      }
    }
  }

  // Vérifier conflits
  const conflicts = await db.reservation.findMany({
    where: {
      locationId: validated.locationId,
      status: { in: ["PENDING", "ACCEPTED"] },
      OR: [
        { AND: [{ start: { lte: validated.start } }, { end: { gt: validated.start } }] },
        { AND: [{ start: { lt: validated.end } }, { end: { gte: validated.end } }] },
        { AND: [{ start: { gte: validated.start } }, { end: { lte: validated.end } }] }
      ]
    }
  })

  if (conflicts.length > 0) {
    return { success: false, error: "Créneau déjà réservé" }
  }

  // Créer avec statut PENDING
  await db.reservation.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      locationId: validated.locationId,
      userId: session.user.id,
      start: validated.start,
      end: validated.end,
      status: "PENDING",
    }
  })

  // Envoyer email aux membres CEE de la commission
  if (location.commission.members.length > 0) {
    const { sendNewReservationNotificationEmail } = await import("@/lib/email")

    for (const member of location.commission.members) {
      await sendNewReservationNotificationEmail(member.email, {
        ceeMemberName: member.name,
        studentName: session.user.name,
        studentEmail: session.user.email,
        title: validated.title,
        description: validated.description,
        locationName: location.name,
        commissionName: location.commission.name,
        start: validated.start,
        end: validated.end
      })
    }
  }

  revalidatePath("/reservations")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function cancelReservation(reservationId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { success: false, error: "Non authentifié" }
  }

  const reservation = await db.reservation.findUnique({
    where: { id: reservationId }
  })

  if (!reservation || reservation.userId !== session.user.id) {
    return { success: false, error: "Non autorisé" }
  }

  if (reservation.status !== "PENDING") {
    return { success: false, error: "Seules les réservations en attente peuvent être annulées" }
  }

  await db.reservation.delete({
    where: { id: reservationId }
  })

  revalidatePath("/reservations")
  revalidatePath("/dashboard")

  return { success: true }
}
