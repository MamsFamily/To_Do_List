const { Client, GatewayIntentBits, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

const guilds = new Map();

function getGuild(guildId) {
  if (!guilds.has(guildId)) {
    guilds.set(guildId, {
      lists: new Map(),
      defaultList: 'Tâches'
    });
    const guild = guilds.get(guildId);
    guild.lists.set('Tâches', { tasks: [], counter: 0 });
  }
  return guilds.get(guildId);
}

function getList(guildId, listName) {
  const guild = getGuild(guildId);
  if (!guild.lists.has(listName)) {
    return null;
  }
  return guild.lists.get(listName);
}

function createList(guildId, listName) {
  const guild = getGuild(guildId);
  if (guild.lists.has(listName)) {
    return { success: false, message: 'Une liste avec ce nom existe déjà.' };
  }
  guild.lists.set(listName, { tasks: [], counter: 0 });
  return { success: true };
}

function getNextId(guildId, listName) {
  const list = getList(guildId, listName);
  if (!list) return null;
  list.counter++;
  return list.counter;
}

const commands = [
  new SlashCommandBuilder()
    .setName('list')
    .setDescription('Gérer vos listes de tâches')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Créer une nouvelle liste')
        .addStringOption(option =>
          option
            .setName('titre')
            .setDescription('Le titre de la nouvelle liste')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('show')
        .setDescription('Afficher toutes les listes disponibles')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer une liste entière')
        .addStringOption(option =>
          option
            .setName('titre')
            .setDescription('Le titre de la liste à supprimer')
            .setRequired(true)
        )
    ),
  new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Gérer vos tâches')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Ajouter une nouvelle tâche')
        .addStringOption(option =>
          option
            .setName('tache')
            .setDescription('La tâche à ajouter')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('liste')
            .setDescription('Le nom de la liste (optionnel)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('Afficher les tâches d\'une liste')
        .addStringOption(option =>
          option
            .setName('liste')
            .setDescription('Le nom de la liste (optionnel)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('complete')
        .setDescription('Marquer une tâche comme complétée')
        .addIntegerOption(option =>
          option
            .setName('numero')
            .setDescription('Le numéro de la tâche à compléter')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('liste')
            .setDescription('Le nom de la liste (optionnel)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer une tâche')
        .addIntegerOption(option =>
          option
            .setName('numero')
            .setDescription('Le numéro de la tâche à supprimer')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('liste')
            .setDescription('Le nom de la liste (optionnel)')
            .setRequired(false)
        )
    )
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  
  try {
    console.log('🔄 Enregistrement des commandes slash...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Commandes slash enregistrées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'list') {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const guild = getGuild(guildId);
    
    if (subcommand === 'create') {
      const title = interaction.options.getString('titre');
      const result = createList(guildId, title);
      
      if (!result.success) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(result.message)
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Liste créée')
        .setDescription(`La liste **${title}** a été créée avec succès !`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'show') {
      if (guild.lists.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFFAA00)
          .setTitle('📋 Listes de tâches')
          .setDescription('Aucune liste pour le moment.')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      let description = '';
      for (const [listName, listData] of guild.lists) {
        const activeTasks = listData.tasks.filter(t => !t.completed).length;
        const completedTasks = listData.tasks.filter(t => t.completed).length;
        const totalTasks = listData.tasks.length;
        
        description += `📝 **${listName}**\n`;
        description += `   └ ${totalTasks} tâche(s) : ${activeTasks} active(s), ${completedTasks} complétée(s)\n\n`;
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📋 Toutes les listes')
        .setDescription(description)
        .setFooter({ text: `${guild.lists.size} liste(s) au total` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'delete') {
      const title = interaction.options.getString('titre');
      
      if (title === guild.defaultList) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(`Impossible de supprimer la liste par défaut "${guild.defaultList}". Cette liste doit toujours exister pour les commandes /todo sans paramètre de liste.`)
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      if (!guild.lists.has(title)) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(`Aucune liste trouvée avec le titre "${title}".`)
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      guild.lists.delete(title);
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🗑️ Liste supprimée')
        .setDescription(`La liste **${title}** et toutes ses tâches ont été supprimées.`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
  }
  
  if (interaction.commandName === 'todo') {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const guild = getGuild(guildId);
    let listName = interaction.options.getString('liste') || guild.defaultList;
    
    const list = getList(guildId, listName);
    if (!list) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Erreur')
        .setDescription(`La liste "${listName}" n'existe pas. Utilisez \`/list show\` pour voir toutes les listes disponibles.`)
        .setTimestamp();
      
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    if (subcommand === 'add') {
      const task = interaction.options.getString('tache');
      const newId = getNextId(guildId, listName);
      list.tasks.push({
        id: newId,
        task: task,
        completed: false,
        createdAt: new Date()
      });
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Tâche ajoutée')
        .setDescription(`**${task}**`)
        .setFooter({ text: `Liste: ${listName} | Tâche #${newId}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'view') {
      if (list.tasks.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFFAA00)
          .setTitle(`📝 ${listName}`)
          .setDescription('Aucune tâche pour le moment.')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      const activeTodos = list.tasks.filter(t => !t.completed);
      const completedTodos = list.tasks.filter(t => t.completed);
      
      let description = '';
      
      if (activeTodos.length > 0) {
        description += '**📌 Tâches actives:**\n';
        activeTodos.forEach((todo) => {
          description += `${todo.id}. ⬜ ${todo.task}\n`;
        });
        description += '\n';
      }
      
      if (completedTodos.length > 0) {
        description += '**✅ Tâches complétées:**\n';
        completedTodos.forEach((todo) => {
          description += `${todo.id}. ✅ ~~${todo.task}~~\n`;
        });
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`📝 ${listName}`)
        .setDescription(description)
        .setFooter({ text: `${activeTodos.length} active(s) | ${completedTodos.length} complétée(s)` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'complete') {
      const taskNumber = interaction.options.getInteger('numero');
      const todo = list.tasks.find(t => t.id === taskNumber);
      
      if (!todo) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(`Aucune tâche trouvée avec le numéro ${taskNumber} dans la liste "${listName}".`)
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      if (todo.completed) {
        const embed = new EmbedBuilder()
          .setColor(0xFFAA00)
          .setTitle('⚠️ Attention')
          .setDescription('Cette tâche est déjà complétée.')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      todo.completed = true;
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Tâche complétée')
        .setDescription(`**~~${todo.task}~~**`)
        .setFooter({ text: `Liste: ${listName} | Tâche #${todo.id}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'delete') {
      const taskNumber = interaction.options.getInteger('numero');
      const todoIndex = list.tasks.findIndex(t => t.id === taskNumber);
      
      if (todoIndex === -1) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(`Aucune tâche trouvée avec le numéro ${taskNumber} dans la liste "${listName}".`)
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      const deletedTodo = list.tasks[todoIndex];
      list.tasks.splice(todoIndex, 1);
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🗑️ Tâche supprimée')
        .setDescription(`**${deletedTodo.task}**`)
        .setFooter({ text: `Liste: ${listName} | Tâche #${deletedTodo.id}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
  }
});

client.on('error', error => {
  console.error('❌ Erreur Discord:', error);
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ ERREUR: Le token Discord (DISCORD_BOT_TOKEN) n\'est pas défini dans les variables d\'environnement!');
  console.log('ℹ️ Veuillez ajouter votre token Discord dans les Secrets de Replit.');
  process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('❌ Erreur de connexion:', error);
  process.exit(1);
});
