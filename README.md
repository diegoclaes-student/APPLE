# 🍎 Jus de Pomme - Système de Réservation

Un système moderne de réservation de créneaux pour les **Pionniers d'Ecaussinnes**, construit avec Node.js, Express, Supabase et déployé sur Vercel.

## ✨ Fonctionnalités

- 📅 **Réservation de créneaux** de 15 minutes
- 📧 **Confirmations par email** automatiques
- ✏️ **Modification et annulation** de réservations
- 👨‍💼 **Interface d'administration** sécurisée
- 📱 **Design responsive** moderne
- 🔒 **Sécurité avancée** avec rate limiting
- 🚀 **Déploiement serverless** sur Vercel
- 🗄️ **Base de données** Supabase PostgreSQL

## 🏗️ Architecture

```
jus-de-pomme-reservations/
├── api/
│   └── index.js              # Point d'entrée Vercel
├── lib/
│   ├── email.js              # Service email
│   ├── supabaseDatabase.js   # Service base de données
│   └── validation.js         # Validation des données
├── middleware/
│   ├── auth.js               # Authentification & helpers
│   └── rateLimiter.js        # Limitation de taux
├── routes/
│   ├── public.js             # Routes publiques
│   └── admin.js              # Routes administrateur
├── config/
│   └── supabase.js           # Configuration Supabase
├── src/
│   ├── views/                # Templates EJS
│   └── public/               # Fichiers statiques
├── package.json
├── vercel.json               # Configuration Vercel
├── supabase-schema.sql       # Schéma de base de données
└── .env.example              # Variables d'environnement
```

## 🚀 Déploiement Rapide

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans l'éditeur SQL, exécutez le contenu de `supabase-schema.sql`
4. Récupérez vos clés API dans Settings > API

### 2. Déployer sur Vercel

1. Forkez ce repository
2. Connectez-vous à [vercel.com](https://vercel.com)
3. Importez votre fork
4. Configurez les variables d'environnement (voir section ci-dessous)
5. Déployez !

### 3. Variables d'environnement Vercel

Dans votre dashboard Vercel, ajoutez ces variables :

```bash
NODE_ENV=production
BASE_URL=https://votre-app.vercel.app
SESSION_SECRET=votre-secret-session-ultra-securise
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-publique
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
ADMIN_PASSWORD_HASH=votre-hash-bcrypt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM="Jus de pomme <noreply@votre-domaine.com>"
```

## 🛠️ Développement Local

### Prérequis
- Node.js 18+
- Un projet Supabase configuré

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/jus-de-pomme-reservations
cd jus-de-pomme-reservations

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos vraies valeurs

# Lancer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

### Scripts disponibles

```bash
npm start      # Lancer en production
npm run dev    # Lancer en développement avec nodemon
npm run build  # Build pour production (Vercel)
```

## 🔧 Configuration

### Email SMTP

Pour les emails de confirmation, vous pouvez utiliser :

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app  # Générez un mot de passe d'app
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Mot de passe admin sécurisé

Générez un hash bcrypt :

```bash
node -e "console.log(require('bcryptjs').hashSync('votre-mot-de-passe', 10))"
```

Utilisez le résultat dans `ADMIN_PASSWORD_HASH`.

## 🗄️ Base de Données

### Structure

- **presences** : Créneaux de présence par lieu et date
- **slots** : Créneaux de 15 minutes généré automatiquement
- **reservations** : Réservations des clients

### Migrations

Le fichier `supabase-schema.sql` contient :
- Création des tables
- Index pour les performances
- Politiques de sécurité RLS
- Triggers pour `updated_at`

## 🔒 Sécurité

- ✅ **Rate limiting** sur les API
- ✅ **Validation** des données avec Joi
- ✅ **Sanitization** des entrées
- ✅ **CORS** configuré
- ✅ **Helmet** pour les headers de sécurité
- ✅ **Sessions** sécurisées
- ✅ **Row Level Security** Supabase

## 📱 Interface Utilisateur

### Pages publiques
- `/` - Liste des créneaux disponibles
- `/reserve/:slotId` - Formulaire de réservation
- `/r/:token/edit` - Modification de réservation
- `/r/:token/cancel` - Annulation de réservation

### Administration
- `/admin/login` - Connexion admin
- `/admin` - Dashboard avec statistiques
- `/admin/presences/new` - Créer de nouveaux créneaux
- `/admin/reservations` - Gérer les réservations

## 🎨 Personnalisation

### Couleurs
Modifiez les variables CSS dans `src/public/styles.css` :

```css
:root {
  --primary-color: #7B1E2B;  /* Bordeaux */
  --accent-color: #B23A48;   /* Rouge */
}
```

### Branding
Changez le nom et les couleurs dans les constantes `BRAND` des routes.

## 🐛 Dépannage

### Erreurs courantes

**"Missing Supabase environment variables"**
- Vérifiez que `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont définis

**"SMTP connection failed"**
- Vérifiez vos credentials SMTP
- En développement, les emails s'affichent dans la console

**"Invalid admin password"**
- Vérifiez `ADMIN_PASSWORD` ou `ADMIN_PASSWORD_HASH`

### Logs

En développement :
```bash
npm run dev
```

En production, consultez les logs Vercel dans votre dashboard.

## 📊 Monitoring

- **Health check** : `GET /health`
- **Logs** : Dashboard Vercel
- **Base de données** : Dashboard Supabase
- **Emails** : Logs du provider SMTP

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez (`git commit -m 'Add AmazingFeature'`)
4. Poussez (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Roadmap

- [ ] Notifications push
- [ ] Export CSV des réservations
- [ ] API REST complète
- [ ] Interface mobile native
- [ ] Intégration calendrier (iCal)
- [ ] Multi-langue
- [ ] Paiements en ligne

## 🆘 Support

- 📧 **Email** : support@votre-domaine.com
- 💬 **Issues** : [GitHub Issues](https://github.com/votre-username/jus-de-pomme-reservations/issues)
- 📚 **Wiki** : [Documentation détaillée](https://github.com/votre-username/jus-de-pomme-reservations/wiki)

---

**Fait avec ❤️ pour les Pionniers d'Ecaussinnes**