# Implémentation du Rate Limiting - Résumé

## 🎯 Objectif

Protéger le formulaire de connexion front-office contre les attaques par force brute en limitant les tentatives de connexion.

## ✅ Ce qui a été implémenté

### 1. Modèle de Base de Données (Prisma)

**Fichier:** `prisma/schema.prisma`

Nouveau modèle `LoginAttempt`:
```prisma
model LoginAttempt {
  id           String    @id @default(cuid())
  email        String
  ipAddress    String?
  success      Boolean   @default(false)
  blockedUntil DateTime?
  blockLevel   Int       @default(0)
  createdAt    DateTime  @default(now())

  @@index([email, createdAt])
  @@index([ipAddress, createdAt])
  @@index([email, blockedUntil])
  @@index([ipAddress, blockedUntil])
}
```

**Indices créés** pour optimiser les requêtes sur email, IP et dates.

---

### 2. Server Actions

**Fichier:** `src/actions/auth-rate-limit.ts`

Trois fonctions principales:

#### `checkRateLimit(email)`
- Vérifie si l'email ou l'IP est bloqué
- Retourne le temps restant en secondes
- Compte les tentatives récentes (dernière heure)

#### `recordLoginAttempt(email, success)`
- Enregistre une tentative (succès ou échec)
- Déclenche un blocage après 3 échecs
- Escalade: 10min → 30min → reset après 24h
- Reset complet après succès

#### `resetLoginAttempts(email)`
- Supprime toutes les tentatives pour l'email/IP
- Appelé après login Google réussi

**Constantes:**
- `MAX_ATTEMPTS = 3`
- `FIRST_BLOCK_DURATION = 10 minutes`
- `SECOND_BLOCK_DURATION = 30 minutes`
- `RESET_WINDOW = 24 heures`

---

### 3. Login Form (Client Component)

**Fichier:** `src/features/auth/login-form.tsx`

**Modifications:**
1. Import des actions rate limiting
2. État local `rateLimitState` pour gérer le blocage
3. `useEffect` pour le compte à rebours en temps réel
4. Vérification avant `authClient.signIn.email()`
5. Enregistrement du résultat (succès/échec)
6. Interface utilisateur avec:
   - Message de blocage avec emoji 🔒
   - Compte à rebours dynamique (MM:SS)
   - Bouton Google OAuth pendant le blocage
   - Désactivation du formulaire

**UX:**
```
🔒 Trop de tentatives de connexion
Votre compte est temporairement bloqué.
Réessayez dans 09:34

Vous pouvez vous connecter avec Google:
[Bouton Google]
```

---

### 4. Callback Google OAuth

**Fichier:** `src/app/api/auth/callback/google/route.ts`

- Intercepte le callback Google
- Reset automatique du rate limiting après login Google réussi
- Log: `✅ Rate limit reset after Google login`

---

### 5. Nettoyage Automatique (Optionnel)

**Fichier:** `src/lib/cron.ts`

Deux fonctions:
- `cleanupOldLoginAttempts()` : Supprime tentatives > 7 jours
- `cleanupExpiredBlocks()` : Supprime blocages expirés

Peut être appelé:
- Via Vercel Cron Jobs (production)
- Lors du démarrage de l'app
- Manuellement via une route API

---

## 🔒 Sécurité Implémentée

### 1. Double Critère de Blocage
- **Email:** Bloqué après 3 échecs
- **IP:** Bloquée après 3 échecs
- Protection contre attaques distribuées

### 2. Normalisation des Emails
```typescript
const normalizedEmail = email.toLowerCase().trim()
```
- `test@example.com` = `TEST@EXAMPLE.COM`

### 3. Récupération IP Sécurisée
```typescript
headers.get("x-forwarded-for")?.split(",")[0] ||
headers.get("x-real-ip")
```
- Compatible avec proxies (Vercel, Nginx)

### 4. Escalade Intelligente
- 1er blocage: 10 minutes
- 2ème blocage (dans les 24h): 30 minutes
- Reset après 24h sans tentative

### 5. Bypass Google OAuth
- OAuth reste fonctionnel pendant blocage
- Reset automatique après login Google réussi

---

## 📊 Flux de Données

```
1. User submit form
   ↓
2. checkRateLimit(email)
   ├─ Bloqué ? → Afficher message + timer
   └─ OK ? → Continue
      ↓
3. authClient.signIn.email()
   ├─ Succès ? → recordLoginAttempt(email, true) → Reset
   └─ Échec ? → recordLoginAttempt(email, false)
      ├─ 3ème échec ? → Créer blocage
      └─ < 3 ? → Afficher tentatives restantes
```

---

## 🗂️ Fichiers Créés/Modifiés

### Créés:
- ✅ `src/actions/auth-rate-limit.ts` (254 lignes)
- ✅ `src/app/api/auth/callback/google/route.ts` (27 lignes)
- ✅ `src/lib/cron.ts` (47 lignes)
- ✅ `RATE_LIMITING_TESTS.md` (guide de tests)
- ✅ `RATE_LIMITING_IMPLEMENTATION.md` (ce fichier)

### Modifiés:
- ✅ `prisma/schema.prisma` (+15 lignes - modèle LoginAttempt)
- ✅ `src/features/auth/login-form.tsx` (+95 lignes)

---

## 🚀 Prochaines Étapes

### 1. Migration Prisma
```bash
cd front-office
npx prisma migrate dev --name add_login_attempt_rate_limiting
npx prisma generate
```

### 2. Redémarrer le Serveur
```bash
npm run dev
```

### 3. Tests Manuels
Suivre le guide: `RATE_LIMITING_TESTS.md`

### 4. Configuration Production (Vercel)

Vérifier les variables d'environnement:
- `DATABASE_URL`
- `GOOGLE_REDIRECT_URI` (doit pointer vers `/api/auth/callback/google`)

### 5. Optionnel: Cron Job

Créer un cron job pour nettoyer les anciennes tentatives (voir guide de tests).

---

## 📈 Métriques à Surveiller

### En développement:
- Temps de réponse `checkRateLimit()` (devrait être < 100ms)
- Logs console lors des blocages
- Compte à rebours UI (doit se mettre à jour chaque seconde)

### En production:
- Nombre de blocages par jour (via logs)
- Emails/IPs les plus bloqués (potentiels attaquants)
- Taux de conversion Google OAuth pendant blocage

**Query utile:**
```sql
SELECT
  email,
  COUNT(*) as attempts,
  MAX("createdAt") as last_attempt
FROM "LoginAttempt"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
  AND success = false
GROUP BY email
ORDER BY attempts DESC
LIMIT 10;
```

---

## 🐛 Résolution de Problèmes

### Erreur: Table LoginAttempt n'existe pas
```bash
npx prisma migrate deploy
npx prisma generate
```

### Le compte à rebours ne fonctionne pas
- Vérifier la console navigateur (erreurs React?)
- Vérifier que `rateLimitState.remainingTime` est bien un nombre

### Google OAuth ne reset pas
- Vérifier que la route `/api/auth/callback/google` existe
- Vérifier les logs: doit afficher `✅ Rate limit reset`
- Vérifier que `GOOGLE_REDIRECT_URI` pointe vers cette route

### Performance dégradée
- Vérifier que les index DB sont créés:
```sql
\d "LoginAttempt"
```
- Activer Prisma query logs pour détecter N+1

---

## 💡 Améliorations Futures

### Court terme:
- [ ] Ajouter un CAPTCHA après 2 blocages
- [ ] Email d'alerte après blocage (sécurité)
- [ ] Dashboard admin pour voir les blocages

### Long terme:
- [ ] Intégration avec un service anti-bot (Cloudflare Turnstile)
- [ ] Machine learning pour détecter patterns d'attaque
- [ ] Rate limiting sur d'autres endpoints (signup, reset password)

---

## 📚 Références

- [Better Auth Documentation](https://better-auth.com/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 📝 Notes Importantes

1. **Ne pas modifier MAX_ATTEMPTS sans tester** - Pourrait créer des faux positifs
2. **Les index DB sont critiques** - Sans eux, performance dégradée sur gros volumes
3. **Google OAuth est le seul bypass** - C'est voulu pour la sécurité
4. **Les IPs sont optionnelles** - Si header absent, seul l'email est utilisé
5. **blockLevel cap à 2** - 30min est le max, pas d'escalade infinie

---

## ✅ Validation Complète

- [x] Modèle Prisma créé avec index
- [x] Server actions implémentées avec normalisation
- [x] Login form modifié avec UI blocage
- [x] Callback Google avec reset
- [x] Système de nettoyage (optionnel)
- [x] Documentation tests complète
- [x] Documentation implémentation

**Statut:** ✅ Prêt pour tests et déploiement
