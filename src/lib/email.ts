import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import NewReservationNotificationEmail from "../../emails/new-reservation-notification-email"

// Configuration du transporteur Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Fonction helper pour envoyer un email
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"ESP Réservation" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("✅ Email envoyé:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Erreur envoi email:", error)
    throw error
  }
}

// Fonction pour envoyer une notification de nouvelle réservation aux membres CEE
export async function sendNewReservationNotificationEmail(
  to: string,
  data: {
    ceeMemberName: string
    studentName: string
    studentEmail: string
    title: string
    description?: string
    locationName: string
    commissionName: string
    start: Date
    end: Date
  }
) {
  const html = await render(NewReservationNotificationEmail(data))
  
  return sendEmail({
    to,
    subject: `🔔 Nouvelle demande de réservation - ${data.locationName}`,
    html,
  })
}
