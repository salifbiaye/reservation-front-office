import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface WelcomeEmailProps {
  name: string
  email: string
}

export default function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur ESP Réservation - Votre compte a été créé avec succès</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header avec logo */}
          <Section style={header}>
            <Heading style={heading}>ESP Réservation</Heading>
            <Text style={tagline}>École Supérieure Polytechnique</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Bienvenue {name} ! 🎉</Heading>

            <Text style={text}>
              Votre compte a été créé avec succès sur la plateforme ESP Réservation.
            </Text>

            <Text style={text}>
              Vous pouvez désormais réserver facilement les espaces et ressources de l'ESP.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Votre email de connexion :</Text>
              <Text style={infoValue}>{email}</Text>
            </Section>

            <Text style={text}>
              <strong>Que pouvez-vous faire ?</strong>
            </Text>
            <ul style={list}>
              <li style={listItem}>✅ Réserver des salles et espaces</li>
              <li style={listItem}>✅ Consulter vos réservations en temps réel</li>
              <li style={listItem}>✅ Voir le calendrier des disponibilités</li>
              <li style={listItem}>✅ Gérer votre profil</li>
            </ul>

            <Section style={buttonContainer}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={button}>
                Accéder à mon espace
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Besoin d'aide ? Contactez-nous à{" "}
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

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "40px 0 20px",
}

const text = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "16px 0",
}

const infoBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
}

const infoLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 8px 0",
}

const infoValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0",
}

const list = {
  margin: "16px 0",
  padding: "0 0 0 20px",
}

const listItem = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "8px 0",
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
