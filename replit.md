# Bot Discord - Gestionnaire de Listes de Tâches

## Vue d'ensemble
Bot Discord en français pour gérer plusieurs listes de tâches par serveur. Chaque serveur peut créer des listes personnalisées avec des titres, et gérer leurs tâches indépendamment via des commandes slash.

## État actuel
- ✅ Bot Discord fonctionnel avec discord.js v14
- ✅ Système de listes multiples par serveur
- ✅ Gestion complète des listes et tâches
- ✅ Commandes slash implémentées avec autocomplete
- ✅ Messages éphémères pour confirmations (add, complete, delete)
- ✅ Dashboard auto-mise à jour pour chaque liste
- ⏳ En attente du token Discord pour démarrer

## Architecture du projet
```
.
├── index.js          # Fichier principal du bot
├── package.json      # Configuration et dépendances
└── replit.md         # Documentation
```

## Fonctionnalités

### Commandes de gestion des listes

1. `/list create` - Créer une nouvelle liste
   - Paramètre: `titre` (nom de la liste, requis)
   - Exemple: `/list create titre:Courses`

2. `/list show` - Afficher toutes les listes disponibles
   - Affiche chaque liste avec le nombre de tâches actives et complétées
   - Montre un aperçu de toutes vos listes

3. `/list delete` - Supprimer une liste entière
   - Paramètre: `titre` (nom de la liste à supprimer, requis)
   - ⚠️ Supprime la liste ET toutes ses tâches
   - 🗑️ Supprime également le dashboard associé dans le canal
   - Exemple: `/list delete titre:Courses`

### Commandes de gestion des tâches

1. `/todo add` - Ajouter une nouvelle tâche
   - Paramètre: `tache` (texte de la tâche, requis)
   - Paramètre: `liste` (nom de la liste, optionnel avec autocomplete)
   - Si aucune liste n'est spécifiée, utilise la liste par défaut "Tâches"
   - 🔒 Message de confirmation visible uniquement pour vous (éphémère)
   - 📊 Met à jour automatiquement le dashboard de la liste dans le canal
   - Exemple: `/todo add tache:Acheter du pain liste:Courses`

2. `/todo view` - Afficher les tâches d'une liste
   - Paramètre: `liste` (nom de la liste, optionnel avec autocomplete)
   - Affiche les tâches actives et complétées séparément
   - Compteur de tâches
   - Exemple: `/todo view liste:Courses`

3. `/todo complete` - Marquer une tâche comme complétée
   - Paramètre: `numero` (numéro de la tâche, requis)
   - Paramètre: `liste` (nom de la liste, optionnel avec autocomplete)
   - 🔒 Message de confirmation visible uniquement pour vous (éphémère)
   - 📊 Met à jour automatiquement le dashboard de la liste dans le canal
   - Exemple: `/todo complete numero:1 liste:Courses`

4. `/todo delete` - Supprimer une tâche
   - Paramètre: `numero` (numéro de la tâche, requis)
   - Paramètre: `liste` (nom de la liste, optionnel avec autocomplete)
   - 🔒 Message de confirmation visible uniquement pour vous (éphémère)
   - 📊 Met à jour automatiquement le dashboard de la liste dans le canal
   - Exemple: `/todo delete numero:2 liste:Courses`

### Caractéristiques techniques
- Système de listes multiples par serveur Discord
- Liste par défaut "Tâches" créée automatiquement
- Stockage en mémoire par serveur Discord (guildId)
- Embeds colorés pour une meilleure présentation
- Gestion d'erreurs avec messages explicites
- Numérotation automatique des tâches par liste
- IDs de tâches uniques et persistants (ne sont jamais réutilisés)
- Distinction visuelle entre tâches actives (⬜) et complétées (✅)
- Autocomplete intelligent pour la sélection de listes (filtre en temps réel)
- Messages éphémères pour les confirmations (add, complete, delete) - visibles uniquement par l'utilisateur
- **Dashboard auto-mise à jour** : Chaque liste a un message qui se met à jour automatiquement lors des modifications
  - Le dashboard s'édite dans le même canal (pas de spam)
  - Si vous changez de canal, un nouveau dashboard est créé et l'ancien est supprimé
  - Le dashboard est supprimé automatiquement lors de la suppression de la liste

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

**Gestion des listes :**
```
/list create titre:Courses
/list create titre:Travail
/list show
/list delete titre:Travail
```

**Gestion des tâches (avec la liste par défaut "Tâches") :**
```
/todo add tache:Acheter du pain
/todo view
/todo complete numero:1
/todo delete numero:2
```

**Gestion des tâches dans une liste spécifique :**
```
/todo add tache:Acheter du lait liste:Courses
/todo view liste:Courses
/todo complete numero:1 liste:Courses
/todo delete numero:2 liste:Courses
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
- Le stockage en mémoire signifie que les listes et tâches sont perdues au redémarrage du bot
- Chaque serveur Discord a ses propres listes de tâches indépendantes
- Les numéros de tâches sont uniques par liste et ne sont jamais réutilisés après suppression
- La liste par défaut "Tâches" ne peut pas être supprimée pour garantir le fonctionnement des commandes /todo sans paramètre de liste
