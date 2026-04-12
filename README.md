# 🍽️ Fidelity SaaS

Programme de fidélité digital pour restaurants avec cartes virtuelles et notifications géolocalisées.

## 🚀 Installation rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer Firebase
cp .env.local.example .env.local
# Éditez .env.local avec vos clés Firebase

# 3. Lancer en développement
npm run dev
```

## 📋 Configuration Firebase

1. Créez un compte sur https://console.firebase.google.com (GRATUIT)
2. Créez un nouveau projet
3. Activez **Authentication** → Email/Password
4. Activez **Firestore Database** → Mode test
5. Dans les paramètres du projet, copiez vos clés de configuration
6. Collez-les dans `.env.local`

## 🌐 Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

## 📚 Fonctionnalités

### Pour les restaurateurs
- ✅ Dashboard avec analytics
- ✅ Configuration du programme de fidélité
- ✅ Scanner QR Code intégré
- ✅ Envoi de notifications push
- ✅ Gestion des clients

### Pour les clients
- ✅ Carte de fidélité virtuelle
- ✅ QR Code personnel
- ✅ Suivi des points
- ✅ Notifications géolocalisées

## 🛠️ Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- Vercel (déploiement)

## 📄 Licence

MIT

## 🆘 Support

Pour toute question, consultez la documentation Firebase ou créez une issue.
