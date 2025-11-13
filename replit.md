# Bot Discord - Liste de Tâches

## Vue d'ensemble
Bot Discord en français pour gérer des listes de tâches par serveur. Permet d'ajouter, afficher, compléter et supprimer des tâches via des commandes slash.

## État actuel
- ✅ Bot Discord fonctionnel avec discord.js v14
- ✅ Système de stockage en mémoire par serveur
- ✅ Commandes slash implémentées
- ⏳ En attente du token Discord pour démarrer

## Architecture du projet
```
.
├── index.js          # Fichier principal du bot
├── package.json      # Configuration et dépendances
└── replit.md         # Documentation
```

## Fonctionnalités MVP

### Commandes disponibles
1. `/todo add` - Ajouter une nouvelle tâche
   - Paramètre: `tache` (texte requis)
   
2. `/todo list` - Afficher toutes les tâches
   - Affiche les tâches actives et complétées séparément
   - Compteur de tâches

3. `/todo complete` - Marquer une tâche comme complétée
   - Paramètre: `numero` (numéro de la tâche)
   
4. `/todo delete` - Supprimer une tâche
   - Paramètre: `numero` (numéro de la tâche)

### Caractéristiques techniques
- Stockage en mémoire par serveur Discord (guildId)
- Embeds colorés pour une meilleure présentation
- Gestion d'erreurs avec messages explicites
- Numérotation automatique des tâches
- Distinction visuelle entre tâches actives (⬜) et complétées (✅)

## Configuration requise

### Token Discord
Le bot nécessite un token Discord pour fonctionner. Pour l'obtenir:

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Dans la section "Bot", créez un bot
4. Copiez le token
5. Dans Replit, ajoutez-le dans les Secrets avec la clé `DISCORD_BOT_TOKEN`

### Permissions requises
Le bot a besoin des permissions suivantes:
- Envoyer des messages
- Utiliser les commandes slash
- Lire l'historique des messages

### Inviter le bot
URL d'invitation (remplacez CLIENT_ID par l'ID de votre application):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=2048&scope=bot%20applications.commands
```

## Utilisation

### Exemples de commandes
```
/todo add tache:Acheter du pain
/todo list
/todo complete numero:1
/todo delete numero:2
```

## Dépendances
- **discord.js** v14.24.2 - Bibliothèque Discord pour Node.js
- **Node.js** 20 - Runtime JavaScript

## Améliorations futures
- [ ] Dates d'échéance avec rappels automatiques
- [ ] Attribution de tâches à des membres spécifiques
- [ ] Catégories et tags pour organiser les tâches
- [ ] Recherche et filtrage avancé
- [ ] Persistance avec base de données PostgreSQL
- [ ] Commande pour modifier une tâche existante
- [ ] Priorités de tâches (haute, moyenne, basse)

## Notes techniques
- Le stockage en mémoire signifie que les tâches sont perdues au redémarrage du bot
- Chaque serveur Discord a sa propre liste de tâches indépendante
- Les numéros de tâches ne sont pas réutilisés après suppression
