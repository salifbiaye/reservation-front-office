import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ReservationCreatedProps {
  studentName: string
  reservationTitle: string
  locationName: string
  startDate: Date
  endDate: Date
  description: string
}

export default function ReservationCreated({
  studentName,
  reservationTitle,
  locationName,
  startDate,
  endDate,
  description,
}: ReservationCreatedProps) {
  const formattedStartDate = format(new Date(startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
  const formattedEndDate = format(new Date(endDate), "HH:mm", { locale: fr })

  return (
    <Html>
      <Head />
      <Preview>Votre demande de réservation a été envoyée - {reservationTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>ESP Réservation</Heading>
            <Text style={tagline}>École Supérieure Polytechnique</Text>
          </Section>

          {/* Status Badge */}
          <Section style={content}>
            <Section style={statusBadge}>
              <Text style={statusText}>⏳ En attente de validation</Text>
            </Section>

            <Heading style={h1}>Demande de réservation envoyée</Heading>

            <Text style={text}>
              Bonjour {studentName},
            </Text>

            <Text style={text}>
              Votre demande de réservation a été envoyée avec succès à la commission responsable.
            </Text>

            {/* Reservation Details */}
            <Section style={detailsBox}>
              <Heading style={detailsHeading}>Détails de la réservation</Heading>

              <Section style={detailRow}>
                <Text style={detailLabel}>📌 Titre</Text>
                <Text style={detailValue}>{reservationTitle}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>📍 Lieu</Text>
                <Text style={detailValue}>{locationName}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>📅 Date et heure</Text>
                <Text style={detailValue}>
                  {formattedStartDate}
                  <br />
                  Jusqu'à {formattedEndDate}
                </Text>
              </Section>

              {description && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>📝 Description</Text>
                  <Text style={detailValue}>{description}</Text>
                </Section>
              )}
            </Section>

            {/* Next Steps */}
            <Section style={infoBox}>
              <Text style={infoTitle}>📋 Prochaines étapes</Text>
              <ul style={list}>
                <li style={listItem}>La commission va examiner votre demande</li>
                <li style={listItem}>Vous recevrez un email dès qu'une décision sera prise</li>
                <li style={listItem}>En attendant, vous pouvez consulter le statut dans votre espace</li>
              </ul>
            </Section>

            <Section style={buttonContainer}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/reservations`} style={button}>
                Voir mes réservations
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Contactez-nous à{" "}
              <Link href="mailto:support@esp.sn" style={link}>
                support@esp.sn
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} ESP Réservation. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#1e40af",
}

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
}

const tagline = {
  fontSize: "14px",
  color: "#93c5fd",
  margin: "8px 0 0 0",
}

const content = {
  padding: "0 48px",
}

const statusBadge = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const statusText = {
  display: "inline-block",
  backgroundColor: "#fef3c7",
  color: "#92400e",
  padding: "8px 16px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
}

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "24px 0 16px",
  textAlign: "center" as const,
}

const text = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "16px 0",
}

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
}

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 16px 0",
}

const detailRow = {
  marginBottom: "16px",
}

const detailLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 4px 0",
  fontWeight: "500",
}

const detailValue = {
  fontSize: "16px",
  color: "#1e293b",
  margin: "0",
}

const infoBox = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
}

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e40af",
  margin: "0 0 12px 0",
}

const list = {
  margin: "0",
  padding: "0 0 0 20px",
}

const listItem = {
  fontSize: "14px",
  color: "#334155",
  lineHeight: "24px",
  margin: "4px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#1e40af",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
}

const footer = {
  padding: "0 48px",
  marginTop: "32px",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "32px",
}

const footerText = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "8px 0",
}

const link = {
  color: "#1e40af",
  textDecoration: "underline",
}
