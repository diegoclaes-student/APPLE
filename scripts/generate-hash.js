#!/usr/bin/env node

/**
 * Script pour générer un hash bcrypt sécurisé pour le mot de passe admin
 * Usage: node scripts/generate-hash.js [mot-de-passe]
 */

import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const args = process.argv.slice(2);
const password = args[0];

if (!password) {
  console.log('❌ Erreur: Veuillez fournir un mot de passe');
  console.log('Usage: node scripts/generate-hash.js [mot-de-passe]');
  console.log('Exemple: node scripts/generate-hash.js monMotDePasseSecurise');
  process.exit(1);
}

if (password.length < 8) {
  console.log('⚠️  Attention: Le mot de passe devrait faire au moins 8 caractères');
}

console.log('🔐 Génération du hash bcrypt...\n');

try {
  const hash = bcrypt.hashSync(password, 10);
  const sessionSecret = randomBytes(32).toString('hex');
  
  console.log('✅ Hash généré avec succès!\n');
  console.log('📋 Ajoutez cette ligne à votre fichier .env:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  
  console.log('🔑 Bonus - Secret de session aléatoire:');
  console.log(`SESSION_SECRET=${sessionSecret}\n`);
  
  console.log('⚡ Pour Vercel, ajoutez ces variables d\'environnement:');
  console.log('1. Allez dans votre projet Vercel > Settings > Environment Variables');
  console.log('2. Ajoutez:');
  console.log(`   ADMIN_PASSWORD_HASH = ${hash}`);
  console.log(`   SESSION_SECRET = ${sessionSecret}`);
  
} catch (error) {
  console.error('❌ Erreur lors de la génération du hash:', error.message);
  process.exit(1);
}