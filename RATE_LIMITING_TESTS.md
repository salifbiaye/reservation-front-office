# Tests du Rate Limiting - Guide de Validation

## Prérequis

Avant de commencer les tests, assurez-vous d'avoir :
1. Exécuté la migration Prisma : `npx prisma migrate dev`
2. Généré le client Prisma : `npx prisma generate`
3. Redémarré le serveur de développement

## Tests Fonctionnels

### Test 1: Blocage après 3 tentatives (10 minutes)

**Objectif:** Vérifier que le compte est bloqué après 3 échecs

**Étapes:**
1. Ouvrir la page de connexion front-office
2. Tenter de se connecter avec un email valide mais un mauvais mot de passe
3. Répéter 2 fois (total: 3 tentatives)
4. Observer le message de blocage avec compte à rebours

**Résultat attendu:**
- Après la 1ère tentative: "Identifiants incorrects. 2 tentative(s) restante(s)."
- Après la 2ème tentative: "Identifiants incorrects. 1 tentative(s) restante(s)."
- Après la 3ème tentative:
  ```
  🔒 Trop de tentatives de connexion
  Votre compte est temporairement bloqué.
  Réessayez dans 10:00
  ```
- Le bouton "Se connecter" devient "Compte bloqué" et est désactivé
- Un bouton "Continuer avec Google" apparaît

---

### Test 2: Compte à rebours en temps réel

**Objectif:** Vérifier que le timer se décrémente chaque seconde

**Étapes:**
1. Après avoir déclenché un blocage (Test 1)
2. Observer le compte à rebours

**Résultat attendu:**
- Le temps affiché diminue chaque seconde
- Format: `MM:SS` (ex: 09:59, 09:58, ...)
- Le compteur s'arrête à 00:00 et le formulaire redevient accessible

---

### Test 3: Bypass via Google OAuth

**Objectif:** Vérifier que Google OAuth fonctionne même pendant un blocage

**Étapes:**
1. Bloquer le compte avec 3 tentatives échouées
2. Cliquer sur "Continuer avec Google"
3. Se connecter avec Google
4. Se déconnecter
5. Tenter une connexion email/password normale

**Résultat attendu:**
- La connexion Google réussit malgré le blocage
- Après déconnexion, le rate limiting est réinitialisé
- On peut se connecter normalement avec email/password

---

### Test 4: Escalade du blocage (30 minutes)

**Objectif:** Vérifier que le 2ème blocage dure 30 minutes

**Étapes:**
1. Se bloquer une première fois (3 tentatives)
2. Attendre 10 minutes ou simuler en modifiant `blockedUntil` dans la DB
3. Retenter 3 nouvelles tentatives échouées
4. Observer le nouveau temps de blocage

**Résultat attendu:**
- Le message affiche "Réessayez dans 30:00"
- Le `blockLevel` dans la DB passe à 2

**Simulation rapide (DB):**
```sql
UPDATE "LoginAttempt"
SET "blockedUntil" = NOW() - INTERVAL '1 minute'
WHERE email = 'test@example.com';
```

---

### Test 5: Blocage par IP (attaque distribuée)

**Objectif:** Vérifier que plusieurs emails depuis la même IP déclenchent un blocage IP

**Étapes:**
1. Tenter 3 échecs avec `email1@example.com`
2. Attendre la fin du blocage
3. Tenter 3 échecs avec `email2@example.com` (même navigateur/IP)
4. Observer le blocage

**Résultat attendu:**
- Les 2 emails différents sont bloqués après 3 tentatives chacun
- Le blocage IP protège contre l'attaque par changement d'email

---

### Test 6: Reset après connexion réussie

**Objectif:** Vérifier que le rate limiting est réinitialisé après un succès

**Étapes:**
1. Faire 2 tentatives échouées
2. Se connecter avec les bons identifiants
3. Se déconnecter
4. Faire 3 nouvelles tentatives échouées

**Résultat attendu:**
- Les 2 premières tentatives échouées sont oubliées
- Il faut 3 nouvelles tentatives pour déclencher le blocage (pas 1 seule)

---

### Test 7: Reset après 24h (simulation)

**Objectif:** Vérifier que le blockLevel revient à 1 après 24h

**Étapes:**
1. Se bloquer 2 fois (blockLevel = 2, blocage 30min)
2. Simuler 24h en modifiant `createdAt` dans la DB
3. Attendre la fin du blocage
4. Se bloquer à nouveau

**Résultat attendu:**
- Le nouveau blocage affiche "Réessayez dans 10:00" (blockLevel = 1)

**Simulation (DB):**
```sql
UPDATE "LoginAttempt"
SET "createdAt" = NOW() - INTERVAL '25 hours'
WHERE email = 'test@example.com' AND "blockLevel" = 2;
```

---

## Tests de Sécurité

### Test 8: Normalisation des emails

**Objectif:** Vérifier que `test@example.com` et `TEST@EXAMPLE.COM` sont traités comme identiques

**Étapes:**
1. Tenter 2 échecs avec `test@example.com`
2. Tenter 1 échec avec `TEST@EXAMPLE.COM`

**Résultat attendu:**
- Le 3ème échec déclenche le blocage (normalization fonctionne)

---

### Test 9: IP Spoofing (protection headers)

**Objectif:** Vérifier que l'IP est bien récupérée depuis les headers proxy

**Étapes:**
1. Inspecter les logs lors d'un blocage
2. Vérifier que l'IP affichée correspond à votre IP publique

**Résultat attendu:**
```
console.warn: 🔒 Rate limit triggered: test@example.com (IP: 192.168.1.100)
```

---

## Tests de Performance

### Test 10: Requêtes rapides (rate limit de la vérification)

**Objectif:** S'assurer que `checkRateLimit()` ne ralentit pas la connexion

**Étapes:**
1. Ouvrir les DevTools (Network)
2. Tenter une connexion
3. Mesurer le temps de réponse

**Résultat attendu:**
- Le temps de réponse reste < 500ms
- Pas de N+1 queries (vérifier avec Prisma logs)

---

## Vérifications Base de Données

### Inspecter la table LoginAttempt

```bash
npx prisma studio
```

**Vérifier:**
- Les index sont bien créés (email, ipAddress, blockedUntil)
- Les tentatives sont enregistrées avec les bonnes timestamps
- `blockLevel` s'incrémente correctement

### Query manuelle

```sql
SELECT * FROM "LoginAttempt"
WHERE email = 'test@example.com'
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## Tests de Nettoyage (Optionnel)

### Test du nettoyage automatique

**Fichier:** `src/lib/cron.ts`

**Test:**
1. Créer des tentatives vieilles de 8 jours (modifier `createdAt`)
2. Appeler `cleanupOldLoginAttempts()`
3. Vérifier que les anciennes tentatives sont supprimées

```typescript
// Dans un fichier de test ou une route API temporaire
import { cleanupOldLoginAttempts } from "@/lib/cron"

const deleted = await cleanupOldLoginAttempts()
console.log(`Deleted ${deleted} old attempts`)
```

---

## Checklist Complète

- [ ] Test 1: Blocage après 3 tentatives
- [ ] Test 2: Compte à rebours en temps réel
- [ ] Test 3: Bypass via Google OAuth
- [ ] Test 4: Escalade du blocage (30 minutes)
- [ ] Test 5: Blocage par IP
- [ ] Test 6: Reset après connexion réussie
- [ ] Test 7: Reset après 24h
- [ ] Test 8: Normalisation des emails
- [ ] Test 9: IP headers correctement récupérés
- [ ] Test 10: Performance < 500ms
- [ ] Vérification DB: index créés
- [ ] Vérification logs console
- [ ] Test Google callback reset

---

## Dépannage

### Erreur: "Cannot find module auth-rate-limit"

**Solution:**
```bash
cd front-office
npm install
npx prisma generate
```

### Le compte à rebours ne se met pas à jour

**Vérifier:**
- Le useEffect dans `login-form.tsx` (ligne 40-54)
- Pas d'erreurs dans la console navigateur

### Le blocage ne se déclenche pas

**Vérifier:**
1. La migration a bien été exécutée
2. La table `LoginAttempt` existe dans la DB
3. Les logs console montrent bien les tentatives enregistrées

### Google OAuth ne reset pas le rate limiting

**Vérifier:**
1. La route `/api/auth/callback/google` existe
2. Les logs console montrent: `✅ Rate limit reset after Google login`
3. Le callback URL dans Google Console correspond

---

## Logs à Surveiller

**Succès:**
```
✅ Rate limit reset for: user@example.com
✅ Rate limit reset after Google login: user@example.com
🧹 Cleaned up X old login attempts
```

**Blocage:**
```
🔒 Rate limit triggered: user@example.com (IP: 192.168.1.100)
```

---

## Configuration de Prod (Vercel)

### Variables d'environnement

S'assurer que ces variables sont définies:
- `DATABASE_URL` (avec connection pooling)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (doit pointer vers `/api/auth/callback/google`)

### Cron Job Vercel (Optionnel)

Créer `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-login-attempts",
    "schedule": "0 2 * * *"
  }]
}
```

Et créer `/api/cron/cleanup-login-attempts/route.ts`:
```typescript
import { cleanupOldLoginAttempts } from "@/lib/cron"

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const count = await cleanupOldLoginAttempts()
  return Response.json({ deleted: count })
}
```
