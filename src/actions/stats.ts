"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { fr } from "date-fns/locale"

export async function getStudentStats() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error("Non authentifié")
    }

    const userId = session.user.id

    // Stats globales
    const [total, accepted, rejected, pending, cancelled] = await Promise.all([
        db.reservation.count({ where: { userId } }),
        db.reservation.count({ where: { userId, status: "ACCEPTED" } }),
        db.reservation.count({ where: { userId, status: "REJECTED" } }),
        db.reservation.count({ where: { userId, status: "PENDING" } }),
        db.reservation.count({ where: { userId, status: "CANCELLED" } }),
    ])

    return {
        total,
        accepted,
        rejected,
        pending,
        cancelled,
    }
}

export async function getMonthlyReservations() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error("Non authentifié")
    }

    const userId = session.user.id
    const months = []

    // Obtenir les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const start = startOfMonth(date)
        const end = endOfMonth(date)

        const [total, accepted, rejected, pending] = await Promise.all([
            db.reservation.count({
                where: {
                    userId,
                    createdAt: { gte: start, lte: end }
                }
            }),
            db.reservation.count({
                where: {
                    userId,
                    status: "ACCEPTED",
                    createdAt: { gte: start, lte: end }
                }
            }),
            db.reservation.count({
                where: {
                    userId,
                    status: "REJECTED",
                    createdAt: { gte: start, lte: end }
                }
            }),
            db.reservation.count({
                where: {
                    userId,
                    status: "PENDING",
                    createdAt: { gte: start, lte: end }
                }
            }),
        ])

        months.push({
            month: format(date, "MMM", { locale: fr }),
            total,
            accepted,
            rejected,
            pending,
        })
    }

    return months
}

export async function getLocationStats() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error("Non authentifié")
    }

    const userId = session.user.id

    // Top 5 lieux les plus réservés par l'étudiant
    const reservationsByLocation = await db.reservation.groupBy({
        by: ['locationId'],
        where: { userId },
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 5
    })

    // Récupérer les détails des lieux
    const locationIds = reservationsByLocation.map(r => r.locationId)
    const locations = await db.location.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true, color: true }
    })

    const locationMap = new Map(locations.map(l => [l.id, l]))

    return reservationsByLocation.map(r => ({
        name: locationMap.get(r.locationId)?.name || "Inconnu",
        count: r._count.id,
        color: locationMap.get(r.locationId)?.color || "#3b82f6"
    }))
}

export async function getUpcomingReservations() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error("Non authentifié")
    }

    const userId = session.user.id

    // Prochaines réservations acceptées
    const reservations = await db.reservation.findMany({
        where: {
            userId,
            status: "ACCEPTED",
            start: { gte: new Date() }
        },
        include: {
            location: {
                select: {
                    name: true,
                    color: true
                }
            }
        },
        orderBy: { start: 'asc' },
        take: 5
    })

    return reservations
}

export async function getRecentActivity() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error("Non authentifié")
    }

    const userId = session.user.id

    // Dernières activités (réservations créées/modifiées)
    const activities = await db.reservation.findMany({
        where: { userId },
        include: {
            location: {
                select: {
                    name: true,
                    color: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
    })

    return activities
}