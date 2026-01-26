"use server"

import { db } from "@/lib/db"

/**
 * Vérifie si un utilisateur peut demander un reset de mot de passe
 * Front-office: Seuls les STUDENT sont autorisés
 */
export async function checkPasswordResetEligibility(email: string) {
  const normalizedEmail = email.toLowerCase().trim()
  
  // Chercher l'utilisateur dans la base de données
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { role: true, email: true }
  })

  if (!user) {
    return {
      eligible: false,
      error: "Aucun compte trouvé avec cet email."
    }
  }

  if (user.role !== "STUDENT") {
    return {
      eligible: false,
      error: "Aucun compte trouvé avec cet email."
    }
  }

  return {
    eligible: true,
    error: null
  }
}
