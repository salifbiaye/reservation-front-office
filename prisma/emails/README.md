# 📧 Templates Email - ESP Réservation

Templates email professionnels utilisant React Email pour toutes les notifications du système.

## 📁 Templates Disponibles

### 1. **welcome-email.tsx** - Email de bienvenue
Envoyé après l'inscription d'un nouvel étudiant.

**Contenu:**
- Message de bienvenue personnalisé
- Email de connexion
- Liste des fonctionnalités disponibles
- Bouton d'accès au dashboard

### 2. **reservation-created.tsx** - Confirmation de création
Envoyé à l'étudiant après qu'il ait créé une réservation.

**Contenu:**
- Badge "En attente de validation"
- Détails complets de la réservation (titre, lieu, dates)
- Prochaines étapes du processus
- Lien vers les réservations

### 3. **reservation-accepted.tsx** - Réservation acceptée
Envoyé quand un CEE accepte la réservation.

**Contenu:**
- Badge "Réservation acceptée" (vert)
- Détails de la réservation
- Nom du validateur
- Instructions importantes (horaires, comportement)
- Bouton vers la réservation

### 4. **reservation-rejected.tsx** - Réservation rejetée
Envoyé quand un CEE rejette la réservation.

**Contenu:**
- Badge "Réservation refusée" (rouge)
- Détails de la réservation
- Raison du refus (important!)
- Suggestions pour refaire une demande
- Bouton "Faire une nouvelle demande"

---

## 🚀 Utilisation

### Importer depuis `lib/email.ts`

```typescript
import {
  sendWelcomeEmail,
  sendReservationCreatedEmail,
  sendReservationAcceptedEmail,
  sendReservationRejectedEmail
} from "@/lib/email"
```

### 1. Email de bienvenue

```typescript
await sendWelcomeEmail("etudiant@esp.sn", {
  name: "Prénom Nom",
  email: "etudiant@esp.sn"
})
```

### 2. Confirmation de création

```typescript
await sendReservationCreatedEmail("etudiant@esp.sn", {
  studentName: "Prénom Nom",
  reservationTitle: "Réunion d'équipe",
  locationName: "Salle B101",
  startDate: new Date("2025-11-15T14:00:00"),
  endDate: new Date("2025-11-15T16:00:00"),
  description: "Réunion hebdomadaire du projet..."
})
```

### 3. Réservation acceptée

```typescript
await sendReservationAcceptedEmail("etudiant@esp.sn", {
  studentName: "Prénom Nom",
  reservationTitle: "Réunion d'équipe",
  locationName: "Salle B101",
  startDate: new Date("2025-11-15T14:00:00"),
  endDate: new Date("2025-11-15T16:00:00"),
  validatedBy: "Prénom Nom du CEE"
})
```

### 4. Réservation rejetée

```typescript
await sendReservationRejectedEmail("etudiant@esp.sn", {
  studentName: "Prénom Nom",
  reservationTitle: "Réunion d'équipe",
  locationName: "Salle B101",
  startDate: new Date("2025-11-15T14:00:00"),
  endDate: new Date("2025-11-15T16:00:00"),
  rejectionReason: "La salle est déjà réservée pour un événement important. Veuillez choisir un autre créneau.",
  validatedBy: "Prénom Nom du CEE"
})
```

---

## 🎨 Design

Tous les templates suivent le même design system:

### Couleurs
- **Primaire:** `#1e40af` (Bleu ESP)
- **Succès:** `#16a34a` (Vert)
- **Attention:** `#eab308` (Jaune)
- **Erreur:** `#dc2626` (Rouge)
- **Texte:** `#1e293b` / `#334155`
- **Muted:** `#64748b`

### Structure
1. **Header** - Logo ESP + tagline sur fond bleu
2. **Badge Status** - État de la notification (couleur adaptée)
3. **Titre** - Message principal
4. **Contenu** - Informations détaillées dans des boxes
5. **Call-to-Action** - Bouton d'action principal
6. **Footer** - Contact + copyright

---

## 🛠️ Développement

### Tester les emails localement

1. Lancer le serveur de développement React Email:

```bash
npm run email:dev
```

Cela ouvrira `http://localhost:3000` avec un aperçu de tous les templates.

2. Ajouter le script dans `package.json`:

```json
{
  "scripts": {
    "email:dev": "email dev"
  }
}
```

### Créer un nouveau template

1. Créer un fichier dans `/emails/`
2. Utiliser les composants de `@react-email/components`
3. Suivre la structure existante
4. Ajouter la fonction d'envoi dans `lib/email.ts`

---

## 📦 Dépendances

```json
{
  "resend": "^4.0.0",
  "react-email": "^3.0.0",
  "@react-email/components": "^0.0.23",
  "@react-email/render": "latest",
  "date-fns": "^3.6.0"
}
```

---

## 🔐 Configuration

Les emails sont envoyés via **Resend**.

### Variables d'environnement requises:

```env
RESEND_API_KEY="re_xxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Configuration Resend:

1. Créer un compte sur https://resend.com
2. Vérifier le domaine `esp.sn`
3. Générer une API key
4. L'ajouter dans `.env`

---

## 📊 Exemples d'intégration

### Dans une Server Action

```typescript
// actions/reservation/create.ts
"use server"

import { db } from "@/lib/db"
import { sendReservationCreatedEmail } from "@/lib/email"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function createReservation(data: CreateReservationInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Non authentifié")

  // Créer la réservation
  const reservation = await db.reservation.create({
    data: {
      ...data,
      userId: session.user.id,
      status: "PENDING"
    },
    include: {
      location: true,
      user: true
    }
  })

  // Envoyer l'email de confirmation
  await sendReservationCreatedEmail(session.user.email, {
    studentName: session.user.name,
    reservationTitle: reservation.title,
    locationName: reservation.location.name,
    startDate: reservation.start,
    endDate: reservation.end,
    description: reservation.description
  })

  return reservation
}
```

### Dans une route API

```typescript
// app/api/reservations/accept/route.ts
import { sendReservationAcceptedEmail } from "@/lib/email"

export async function POST(req: Request) {
  // ... logique de validation

  const reservation = await db.reservation.update({
    where: { id },
    data: { status: "ACCEPTED", validatedBy: ceeId },
    include: { user: true, location: true }
  })

  // Envoyer l'email
  await sendReservationAcceptedEmail(reservation.user.email, {
    studentName: reservation.user.name,
    reservationTitle: reservation.title,
    locationName: reservation.location.name,
    startDate: reservation.start,
    endDate: reservation.end,
    validatedBy: ceeName
  })

  return Response.json({ success: true })
}
```

---

## 🎯 Best Practices

1. **Toujours envoyer après l'action DB** - Ne pas bloquer l'action si l'email échoue
2. **Gérer les erreurs** - Logger mais ne pas crasher
3. **Utiliser try/catch** - Les emails peuvent échouer
4. **Tester en local** - Utiliser `email:dev` avant de déployer
5. **Personnaliser** - Utiliser le nom de l'utilisateur
6. **Dates formatées** - Utiliser date-fns avec locale française

---

## 📝 Notes

- Les emails sont **responsives** et s'affichent bien sur mobile
- Les templates utilisent des **styles inline** pour compatibilité email
- Le formatage des dates est en **français** (locale fr)
- Les liens contiennent `NEXT_PUBLIC_APP_URL` depuis `.env`
- Les emails **ne bloquent pas** le flux principal (async/await avec catch)

---

## 🚨 Troubleshooting

### L'email n'est pas reçu
1. Vérifier que `RESEND_API_KEY` est correcte
2. Vérifier que le domaine `esp.sn` est vérifié sur Resend
3. Checker les logs Resend Dashboard
4. Vérifier le dossier spam

### Erreur de rendu
1. Vérifier que tous les props sont passés
2. Vérifier les types TypeScript
3. Tester avec `npm run email:dev`

### Dates mal formatées
1. S'assurer que `date-fns` est installé
2. Vérifier que la locale `fr` est importée
3. Convertir les strings en Date objects si nécessaire

---

**Made with ❤️ for ESP**
