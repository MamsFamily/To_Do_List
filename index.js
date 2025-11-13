const { Client, GatewayIntentBits, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

const todos = new Map();

function getTodos(guildId) {
  if (!todos.has(guildId)) {
    todos.set(guildId, []);
  }
  return todos.get(guildId);
}

const commands = [
  new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Gérer votre liste de tâches')
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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Afficher toutes les tâches')
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
  
  if (interaction.commandName === 'todo') {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const guildTodos = getTodos(guildId);
    
    if (subcommand === 'add') {
      const task = interaction.options.getString('tache');
      guildTodos.push({
        id: guildTodos.length + 1,
        task: task,
        completed: false,
        createdAt: new Date()
      });
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Tâche ajoutée')
        .setDescription(`**${task}**`)
        .setFooter({ text: `Tâche #${guildTodos.length}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'list') {
      if (guildTodos.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFFAA00)
          .setTitle('📝 Liste de tâches')
          .setDescription('Aucune tâche pour le moment.')
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      const activeTodos = guildTodos.filter(t => !t.completed);
      const completedTodos = guildTodos.filter(t => t.completed);
      
      let description = '';
      
      if (activeTodos.length > 0) {
        description += '**📌 Tâches actives:**\n';
        activeTodos.forEach((todo, index) => {
          description += `${todo.id}. ⬜ ${todo.task}\n`;
        });
        description += '\n';
      }
      
      if (completedTodos.length > 0) {
        description += '**✅ Tâches complétées:**\n';
        completedTodos.forEach((todo, index) => {
          description += `${todo.id}. ✅ ~~${todo.task}~~\n`;
        });
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📝 Liste de tâches')
        .setDescription(description)
        .setFooter({ text: `${activeTodos.length} active(s) | ${completedTodos.length} complétée(s)` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'complete') {
      const taskNumber = interaction.options.getInteger('numero');
      const todo = guildTodos.find(t => t.id === taskNumber);
      
      if (!todo) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(`Aucune tâche trouvée avec le numéro ${taskNumber}.`)
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
        .setFooter({ text: `Tâche #${todo.id}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
    
    else if (subcommand === 'delete') {
      const taskNumber = interaction.options.getInteger('numero');
      const todoIndex = guildTodos.findIndex(t => t.id === taskNumber);
      
      if (todoIndex === -1) {
        const embed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('❌ Erreur')
          .setDescription(`Aucune tâche trouvée avec le numéro ${taskNumber}.`)
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      
      const deletedTodo = guildTodos[todoIndex];
      guildTodos.splice(todoIndex, 1);
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🗑️ Tâche supprimée')
        .setDescription(`**${deletedTodo.task}**`)
        .setFooter({ text: `Tâche #${deletedTodo.id}` })
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
