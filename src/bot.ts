import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  SlashCommandBuilder,
  CommandInteraction,
  AutocompleteInteraction,
  CommandInteractionOptionResolver,
  TextChannel,
} from "discord.js";
import { config } from "dotenv";

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const GUILD_ID = "759370265578438706";
const ROLE_REMOVE_ID = "759370265578438707";
const ROLE_ID = "1109572154284064839";
const COMMAND_CHANNEL_ID = "1271374159439728660";
const APPROVED_CHANNEL_ID = "1212544591161458709";
const REJECTED_CHANNEL_ID = "1212544996813705286";

client.once(Events.ClientReady, () => {
  console.log(`Bot está online como ${client.user?.tag}`);
});



const reasons: string[] = ["Motivo 1", "Motivo 2", "Motivo 3", "Outro"];

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    await handleCommand(interaction);
  } else if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
  }
});

const handleCommand = async (interaction: CommandInteraction) => {
  const { options, channel } = interaction;

  if (channel?.id !== COMMAND_CHANNEL_ID) {
    await interaction.reply(
      "Você só pode usar este comando no canal apropriado."
    );
    return;
  }

  const userId = (options as CommandInteractionOptionResolver).getUser(
    "usuario"
  )?.id;
  const reason1 = (options as CommandInteractionOptionResolver).getString(
    "motivo1"
  );
  const reason2 = (options as CommandInteractionOptionResolver).getString(
    "motivo2"
  );

  if (!userId) {
    await interaction.reply("Usuário não encontrado.");
    return;
  }

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return;

  try {
    const member = await guild.members.fetch(userId);
    const isApproved = interaction.commandName === "aprovar";

    if (isApproved) {
      const approvedEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Novo Usuário Aprovado")
        .setDescription(
          `O usuário <@${member.user.id}> foi **aprovado** na allowlist.
          
          Bem-vindo à **Liberty City!** Esperamos que aproveite sua experiência aqui.`
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/1012098789840015551/1273016215329181716/GRINGALOGOBOT.png?ex=66f7befd&is=66f66d7d&hm=fcedbcff21c4a1d8ba0ac6a8329e8eaee9569d0315e12c0d28495dcd079c922d&=&format=webp&quality=lossless&width=629&height=629"
        )
        .setImage(
          "https://media.discordapp.net/attachments/1012098789840015551/1273016980235878511/gringa.png?ex=66f7bfb3&is=66f66e33&hm=2b4df611996bfed85d859a0b6dd6c46ccbed0dd02a4d5aae2c993638cefdbcfb&=&format=webp&quality=lossless&width=1409&height=356"
        )
        .setFooter({
          text: "Gringa Liberty City © Todos os direitos reservados",
          iconURL:
            "https://media.discordapp.net/attachments/1012098789840015551/1273016215329181716/GRINGALOGOBOT.png?ex=66f7befd&is=66f66d7d&hm=fcedbcff21c4a1d8ba0ac6a8329e8eaee9569d0315e12c0d28495dcd079c922d&=&format=webp&quality=lossless&width=629&height=629",
        })
        .setTimestamp();

      await member.send({ embeds: [approvedEmbed] }).catch(console.error);

      const approvedChannel = guild.channels.cache.get(APPROVED_CHANNEL_ID);
      if (approvedChannel instanceof TextChannel) {
        await approvedChannel.send({ embeds: [approvedEmbed] });
      } else {
        console.error("O canal de aprovação não é um canal de texto.");
      }
    } else {
      const rejectedEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Usuário Reprovado")
        .setDescription(
          `O usuário <@${member.user.id}> foi **reprovado** na allowlist.\n` +
            `Não desanime, você ainda pode tentar novamente!`
        )
        .addFields(
          { name: "Motivo 1", value: reason1 || "Nenhum", inline: true },
          { name: "Motivo 2", value: reason2 || "Nenhum", inline: true }
        )
        .setThumbnail(
          "https://media.discordapp.net/attachments/1012098789840015551/1273016215329181716/GRINGALOGOBOT.png?ex=66f7befd&is=66f66d7d&hm=fcedbcff21c4a1d8ba0ac6a8329e8eaee9569d0315e12c0d28495dcd079c922d&=&format=webp&quality=lossless&width=629&height=629"
        )
        .setImage(
          "https://media.discordapp.net/attachments/1012098789840015551/1273016980235878511/gringa.png?ex=66f7bfb3&is=66f66e33&hm=2b4df611996bfed85d859a0b6dd6c46ccbed0dd02a4d5aae2c993638cefdbcfb&=&format=webp&quality=lossless&width=1409&height=356"
        )
        .setFooter({
          text: "Gringa Liberty City © Todos os direitos reservados",
          iconURL:
            "https://media.discordapp.net/attachments/1012098789840015551/1273016215329181716/GRINGALOGOBOT.png?ex=66f7befd&is=66f66d7d&hm=fcedbcff21c4a1d8ba0ac6a8329e8eaee9569d0315e12c0d28495dcd079c922d&=&format=webp&quality=lossless&width=629&height=629",
        })
        .setTimestamp();

      await member.send({ embeds: [rejectedEmbed] }).catch(console.error);

      const rejectedChannel = guild.channels.cache.get(REJECTED_CHANNEL_ID);
      if (rejectedChannel instanceof TextChannel) {
        await rejectedChannel.send({ embeds: [rejectedEmbed] });
      } else {
        console.error("O canal de reprovação não é um canal de texto.");
      }
    }

    await interaction.reply("Ação realizada com sucesso!");

    if (isApproved) {
      const role = guild.roles.cache.get(ROLE_ID);
      if (role) {
        await member.roles.add(role);
        await member.roles.remove(ROLE_REMOVE_ID);
      }
    }
  } catch (error) {
    console.error("Erro ao processar:", error);
    await interaction.reply("Ocorreu um erro ao processar o comando.");
  }
};

const handleAutocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedOption = interaction.options.getFocused(true);

  if (focusedOption.name === "motivo1" || focusedOption.name === "motivo2") {
    const filtered = reasons.filter((reason) =>
      reason.toLowerCase().includes(focusedOption.value.toLowerCase())
    );
    await interaction.respond(
      filtered.map((reason) => ({ name: reason, value: reason }))
    );
  }
};

client.on(Events.ClientReady, async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName("aprovar")
      .setDescription("Aprovar um usuário.")
      .addUserOption((option) =>
        option
          .setName("usuario")
          .setDescription("Usuário a ser aprovado")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("motivo1")
          .setDescription("Motivo 1")
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("motivo2")
          .setDescription("Motivo 2")
          .setAutocomplete(true)
      ),
    new SlashCommandBuilder()
      .setName("reprovar")
      .setDescription("Reprovar um usuário.")
      .addUserOption((option) =>
        option
          .setName("usuario")
          .setDescription("Usuário a ser reprovado")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("motivo1")
          .setDescription("Motivo 1")
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("motivo2")
          .setDescription("Motivo 2")
          .setAutocomplete(true)
      ),
  ].map((command) => command.toJSON());

  await client.application?.commands.set(commands, GUILD_ID);
});

client.login(process.env.BOT_TOKEN);
