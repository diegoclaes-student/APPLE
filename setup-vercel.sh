#!/bin/bash

# 🚀 Script de Configuration Vercel - Jus de Pomme
# Exécutez ce script pour configurer automatiquement les variables d'environnement

echo "🔧 Configuration des variables d'environnement Vercel..."

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installez-le avec: npm i -g vercel"
    exit 1
fi

# Configurer les variables d'environnement
echo "📝 Ajout des variables d'environnement..."

vercel env add NODE_ENV production
vercel env add BASE_URL https://jus-de-pomme-pbqq241av-diegoclaes-students-projects.vercel.app
vercel env add SESSION_SECRET super-secret-session-key-changez-moi-64-caracteres-minimum-abc123
vercel env add SUPABASE_URL https://hjbqggpqwmgayjyecghy.supabase.co
vercel env add SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnFnZ3Bxd21nYXlqeWVjZ2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDU5MTksImV4cCI6MjA3NDcyMTkxOX0.iApFnX_2Ne2tL3ZutKyu0eizGAKiV2og9CwlTcFyTJs
vercel env add SUPABASE_SERVICE_ROLE_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnFnZ3Bxd21nYXlqeWVjZ2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE0NTkxOSwiZXhwIjoyMDc0NzIxOTE5fQ.PwkOn1zEQoz1cyGQWN17lstRUtmWlu_m8mTL-ciMfnI
vercel env add ADMIN_PASSWORD @Banane123

echo "✅ Variables d'environnement configurées!"
echo "🚀 Redéploiement en cours..."

# Redéployer l'application
vercel --prod

echo "🎉 Déploiement terminé!"
echo "🌐 Votre application est disponible à :"
echo "   https://jus-de-pomme-pbqq241av-diegoclaes-students-projects.vercel.app"
echo ""
echo "👤 Accès admin :"
echo "   URL: https://jus-de-pomme-pbqq241av-diegoclaes-students-projects.vercel.app/admin/login"
echo "   Mot de passe: @Banane123"