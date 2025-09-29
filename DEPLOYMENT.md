# 🚀 Guide de Déploiement - Jus de Pomme

Ce guide vous accompagne étape par étape pour déployer votre application de réservation sur Vercel avec Supabase.

## 📋 Prérequis

- [ ] Compte GitHub
- [ ] Compte Vercel (gratuit)
- [ ] Compte Supabase (gratuit)
- [ ] Compte email (Gmail, SendGrid, etc.)

## 🗄️ Étape 1 : Configuration Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub
4. Cliquez sur "New project"
5. Choisissez votre organisation
6. Configurez votre projet :
   - **Name** : `jus-de-pomme-prod`
   - **Database Password** : Générez un mot de passe fort
   - **Region** : `West Europe (eu-west-1)` (recommandé pour l'Europe)
7. Cliquez sur "Create new project"

⏱️ **Attendez 2-3 minutes** que le projet soit créé.

### 1.2 Configurer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Copiez tout le contenu de `supabase-schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur "Run" (▶️)
6. Vérifiez qu'il n'y a pas d'erreur

### 1.3 Récupérer les clés API

1. Allez dans **Settings** > **API**
2. Notez ces valeurs (gardez-les secrètes !) :
   - **URL** : `https://xxxxx.supabase.co`
   - **anon public** : `eyJhbGc...` (clé publique)
   - **service_role** : `eyJhbGc...` (clé secrète)

### 1.4 Configurer l'authentification (optionnel)

1. Allez dans **Authentication** > **Settings**
2. Dans **Site URL**, ajoutez : `https://votre-app.vercel.app`
3. Dans **Redirect URLs**, ajoutez : `https://votre-app.vercel.app/**`

## 🔐 Étape 2 : Configuration Email

### Option A : Gmail (Recommandé pour débuter)

1. Activez la **vérification en 2 étapes** sur votre compte Gmail
2. Allez dans **Compte Google** > **Sécurité** > **Mots de passe des applications**
3. Générez un mot de passe d'application pour "Mail"
4. Notez ce mot de passe (format : `xxxx xxxx xxxx xxxx`)

### Option B : SendGrid (Recommandé pour production)

1. Créez un compte sur [sendgrid.com](https://sendgrid.com)
2. Allez dans **Settings** > **API Keys**
3. Créez une nouvelle API Key avec permissions "Mail Send"
4. Notez la clé API

## 🚀 Étape 3 : Déploiement Vercel

### 3.1 Préparer le code

1. **Forkez** ce repository sur votre GitHub
2. **Clônez** votre fork localement :
   ```bash
   git clone https://github.com/VOTRE-USERNAME/jus-de-pomme-reservations
   cd jus-de-pomme-reservations
   ```

### 3.2 Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Importez votre repository `jus-de-pomme-reservations`
5. Configurez le projet :
   - **Project Name** : `jus-de-pomme-prod`
   - **Framework Preset** : `Other`
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build`
   - **Output Directory** : laissez vide
   - **Install Command** : `npm install`

### 3.3 Configurer les variables d'environnement

Dans la section **Environment Variables**, ajoutez :

#### Variables obligatoires
```bash
NODE_ENV=production
BASE_URL=https://VOTRE-APP.vercel.app
SESSION_SECRET=GÉNÉREZ-UN-SECRET-ALÉATOIRE-64-CARACTÈRES
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### Variables d'email (Gmail)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM="Jus de pomme des pionniers d'Ecaussinnes <noreply@votre-domaine.com>"
```

#### Variables d'email (SendGrid)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
SMTP_FROM="Jus de pomme des pionniers d'Ecaussinnes <noreply@votre-domaine.com>"
```

#### Mot de passe admin
```bash
# Option 1 : Simple (développement)
ADMIN_PASSWORD=votre-mot-de-passe-admin

# Option 2 : Sécurisé (production)
ADMIN_PASSWORD_HASH=$2a$10$xxxxx
```

Pour générer un hash bcrypt :
```bash
node -e "console.log(require('bcryptjs').hashSync('votre-mot-de-passe', 10))"
```

### 3.4 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le déploiement se termine (2-3 minutes)
3. Votre app sera disponible sur `https://VOTRE-APP.vercel.app`

## ✅ Étape 4 : Vérification

### 4.1 Test de base

1. Visitez votre site : `https://VOTRE-APP.vercel.app`
2. Vérifiez que la page d'accueil se charge
3. Testez le health check : `https://VOTRE-APP.vercel.app/health`

### 4.2 Test admin

1. Allez sur : `https://VOTRE-APP.vercel.app/admin/login`
2. Connectez-vous avec votre mot de passe admin
3. Créez une présence de test
4. Vérifiez que les créneaux apparaissent sur la page d'accueil

### 4.3 Test de réservation

1. Faites une réservation de test
2. Vérifiez que l'email de confirmation arrive
3. Testez la modification et l'annulation

## 🔧 Étape 5 : Configuration avancée

### 5.1 Domaine personnalisé (optionnel)

1. Dans Vercel, allez dans **Settings** > **Domains**
2. Ajoutez votre domaine : `reservations.votre-domaine.com`
3. Configurez les DNS selon les instructions
4. Mettez à jour `BASE_URL` avec votre nouveau domaine

### 5.2 Monitoring

1. Activez **Vercel Analytics** pour le monitoring
2. Configurez **Supabase Edge Functions** si nécessaire
3. Ajoutez **Sentry** pour le tracking d'erreurs (optionnel)

### 5.3 Sauvegardes

1. Dans Supabase, activez les **sauvegardes automatiques**
2. Exportez régulièrement vos données importantes

## 🚨 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que toutes les variables Supabase sont définies
- Redéployez après avoir ajouté les variables manquantes

### Erreur "SMTP connection failed"
- Vérifiez vos credentials email
- Testez avec un autre provider SMTP
- En développement, désactivez SMTP (emails en console)

### Erreur 500 au démarrage
- Consultez les logs Vercel : **Functions** > **View Function Logs**
- Vérifiez la syntaxe de vos variables d'environnement

### Base de données vide
- Vérifiez que le schéma SQL a été exécuté correctement
- Consultez les logs Supabase

## 📊 Post-déploiement

### 1. Première présence

Créez votre première présence via l'admin :
1. Connectez-vous à `/admin/login`
2. Allez dans "Nouvelle présence"
3. Remplissez : lieu, date, heure début/fin
4. Validez

### 2. Test complet

1. Réservez un créneau
2. Vérifiez l'email de confirmation
3. Modifiez la réservation
4. Annulez la réservation
5. Vérifiez les statistiques admin

### 3. Communication

Partagez l'URL avec vos utilisateurs :
- `https://VOTRE-APP.vercel.app` - Interface publique
- `https://VOTRE-APP.vercel.app/admin` - Administration

## 📈 Optimisations

### Performance
- Les assets sont automatiquement mis en cache par Vercel
- La base de données Supabase utilise des index optimisés
- Le rate limiting protège contre les abus

### Sécurité
- Variables d'environnement chiffrées par Vercel
- Connexions HTTPS obligatoires
- Session sécurisées avec SameSite
- Protection CSRF intégrée

### Monitoring
- Health check : `/health`
- Logs d'erreur : Dashboard Vercel
- Métriques DB : Dashboard Supabase

## 🎉 Félicitations !

Votre application de réservation est maintenant déployée et opérationnelle !

### Prochaines étapes suggérées :
- [ ] Personnaliser les couleurs et le branding
- [ ] Ajouter votre domaine personnalisé
- [ ] Configurer les sauvegardes
- [ ] Former les administrateurs
- [ ] Communiquer l'URL aux utilisateurs

### Support
- 📧 Issues GitHub pour les bugs
- 💬 Discussions pour les questions
- 📚 README.md pour la documentation

**Bon déploiement ! 🚀**