/**
 * Obtenir le début et la fin d'aujourd'hui
 */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin de cette semaine (lundi-dimanche)
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Lundi = début de semaine

  const start = new Date(now)
  start.setDate(now.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin de ce mois
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin du mois dernier
 */
export function getLastMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin de la semaine dernière
 */
export function getLastWeekRange(): { start: Date; end: Date } {
  const thisWeek = getThisWeekRange()
  const start = new Date(thisWeek.start)
  start.setDate(start.getDate() - 7)

  const end = new Date(thisWeek.end)
  end.setDate(end.getDate() - 7)

  return { start, end }
}

/**
 * Calculer le pourcentage de variation entre deux valeurs
 */
export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Calculer l'heure de fin maximale basée sur l'heure de début et la durée max
 * Gère automatiquement le rollover minuit (ex: 23:00 + 3h = 02:00 jour suivant)
 */
export function calculateMaxEndTime(start: Date, maxHours: number): Date {
  const maxEnd = new Date(start)
  maxEnd.setHours(start.getHours() + maxHours)
  return maxEnd
}

/**
 * Calculer l'heure de fin minimale (début + 15 minutes minimum)
 * Garantit une durée minimale pour la réservation
 */
export function calculateMinEndTime(start: Date): Date {
  const minEnd = new Date(start)
  minEnd.setMinutes(start.getMinutes() + 15)
  return minEnd
}

/**
 * Arrondir une date au quart d'heure le plus proche (15 min)
 * Ex: 10:07 → 10:15, 10:22 → 10:30
 */
export function roundToNearestQuarterHour(date: Date): Date {
  const rounded = new Date(date)
  const minutes = Math.ceil(date.getMinutes() / 15) * 15
  rounded.setMinutes(minutes)
  rounded.setSeconds(0)
  rounded.setMilliseconds(0)
  return rounded
}
