# 🚀 Guide de Déploiement Vercel - Jus de Pomme

## ✅ Étapes Complétées

1. **Code restructuré** ✅
2. **Base de données migrée vers Supabase** ✅
3. **Application déployée sur Vercel** ✅

## 🔧 Configuration des Variables d'Environnement

Votre application est déployée à : **https://jus-de-pomme-pbqq241av-diegoclaes-students-projects.vercel.app**

### Variables à configurer sur Vercel Dashboard :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet "jus-de-pomme"
3. Allez dans Settings > Environment Variables
4. Ajoutez ces variables :

```bash
# Environment
NODE_ENV=production

# Base URL
BASE_URL=https://jus-de-pomme-pbqq241av-diegoclaes-students-projects.vercel.app

# Session Security
SESSION_SECRET=super-secret-session-key-changez-moi-64-caracteres-minimum-abc123

# Supabase Configuration
SUPABASE_URL=https://hjbqggpqwmgayjyecghy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnFnZ3Bxd21nYXlqeWVjZ2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDU5MTksImV4cCI6MjA3NDcyMTkxOX0.iApFnX_2Ne2tL3ZutKyu0eizGAKiV2og9CwlTcFyTJs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnFnZ3Bxd21nYXlqeWVjZ2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE0NTkxOSwiZXhwIjoyMDc0NzIxOTE5fQ.PwkOn1zEQoz1cyGQWN17lstRUtmWlu_m8mTL-ciMfnI

# Admin Authentication
ADMIN_PASSWORD=@Banane123

# Email Configuration (optionnel - configurez avec votre Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app-gmail
SMTP_FROM="Jus de pomme des pionniers d'Ecaussinnes <noreply@votre-domaine.com>"
```

### 📧 Configuration Email (Optionnel)

Pour recevoir les emails de confirmation :
1. Activez l'authentification à 2 facteurs sur Gmail
2. Créez un "Mot de passe d'application" :
   - Gmail > Gérer votre compte Google > Sécurité > Authentification à 2 facteurs > Mots de passe des applications
3. Utilisez ce mot de passe pour `SMTP_PASS`

## 🎯 Fonctionnalités de l'Application

### Pour les Utilisateurs :
- **Page d'accueil** : `/` - Interface de réservation moderne
- **Réservation** : Sélection de créneaux disponibles
- **Confirmation** : Validation des réservations par email
- **Modification** : Possibilité de modifier sa réservation
- **Annulation** : Annulation avec confirmation

### Pour l'Administrateur :
- **Login Admin** : `/admin/login` - Mot de passe : `@Banane123`
- **Dashboard** : `/admin/dashboard` - Vue d'ensemble des réservations
- **Gestion des présences** : `/admin/presences/new` - Créer de nouveaux créneaux
- **Liste des réservations** : `/admin/reservations` - Gestion complète

## 🛠 Architecture Technique

### Structure du Projet :
```
api/
├── index.js           # Point d'entrée Vercel
config/
├── supabase.js        # Configuration Supabase
lib/
├── database.js        # Service base de données
├── email.js           # Service email
└── validation.js      # Validation des données
middleware/
├── auth.js            # Authentification admin
├── error.js           # Gestion d'erreurs
└── security.js       # Sécurité et rate limiting
routes/
├── admin.js           # Routes administration
└── public.js          # Routes publiques
```

### Base de Données Supabase :
- **presences** : Créneaux de vente disponibles
- **slots** : Créneaux horaires par présence
- **reservations** : Réservations des clients

### Sécurité :
- Helmet.js pour les headers de sécurité
- CORS configuré
- Rate limiting (100 req/15min)
- Sessions sécurisées
- Validation Joi sur toutes les entrées
- Authentification admin avec bcrypt

## 🔄 Commandes de Déploiement

```bash
# Redéployer après modifications
git add .
git commit -m "Update: description"
git push origin main

# Déployer directement avec Vercel CLI
vercel --prod
```

## 📊 Monitoring et Logs

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Logs en temps réel** : `vercel logs --follow`
- **Dashboard Supabase** : https://supabase.com/dashboard

## 🎨 Design System

L'application utilise un design system moderne avec :
- Variables CSS pour la cohérence
- Design responsive
- Animations fluides
- Interface intuitive
- Thème cohérent avec couleurs primaires

---

## 🏆 Résultat Final

Votre application "Jus de Pomme" est maintenant :
- ✅ **Professionnellement structurée**
- ✅ **Déployée sur Vercel**
- ✅ **Connectée à Supabase**
- ✅ **Sécurisée et optimisée**
- ✅ **Prête pour la production**

**URL de Production** : https://jus-de-pomme-pbqq241av-diegoclaes-students-projects.vercel.app