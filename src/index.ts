import {Message, GuildMember, TextChannel, MessageAttachment} from "discord.js";
import {Client, NoobsEmbed} from "discord.js-noobs";
import * as antiSpam from "better-discord-antispam";
import {Image, createCanvas, loadImage} from "canvas";
import {NSFWJS} from "nsfwjs";
import {inspect} from "util";
import save from "./save";
import {searchG} from "./searchGuild";
import * as gs from "./guildSetting.json";
import * as words from "./replyWords.json";
import {prefix, token} from "./config.json";

const modelUrl = "https://nsfwjs-model-v3.now.sh/";
const nsfwjs = new NSFWJS(modelUrl, {size: 299});

const client = new Client({
  prefix: [prefix],
  token: token,
  ignoreBots: true,
  options: {
    disabledEvents: ["TYPING_START"],
  },
});

client.on("ready", async () => {
  await nsfwjs.load().catch(console.error);
  await antiSpam(client, {
    limitUntilWarn: 5,
    limitUntilMuted: 5,
    interval: 2000,
    warningMessage: new NoobsEmbed()
      .setTitle("Warning!")
      .setDescription(
        "If you don't stop spamming,\nI'm going to punish you..."
      ),
    ignoredRoles: ["admin"],
  });
});

client.on("guildMemberAdd", async (member: GuildMember) => {
  const target = searchG(member.guild.id);
  await member.roles.add(target.noAuthRole);
  const canvas = createCanvas(2400, 1676);
  const ctx = canvas.getContext("2d");
  const applyText = (canvas, text): string => {
    let fontSize: number = 260;
    do {
      ctx.font = `${(fontSize -= 10)}px sans-serif`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
  };
  const str =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890123456789";
  let result: string = "";
  for (let i = 0; i < 8; i++) {
    result += str[Math.floor(Math.random() * str.length)];
  }
  const background = await loadImage(
    "https://cdn.discordapp.com/attachments/706722308881907715/735891652677337208/image0.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ff0000";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.font = applyText(canvas, result);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(result, canvas.width / 3.45, canvas.height / 1.65);
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  const avatar = await loadImage(
    "https://cdn.glitch.com/fcd0884c-187a-413e-ade3-3511e7eea35c%2F%E7%84%A1%E9%A1%8C111_20200505161822.png?v=1588663142150"
  );
  ctx.drawImage(avatar, 25, 25, 200, 200);
  const message = await member.send(
    new MessageAttachment(canvas.toBuffer(), "code.png")
  );

  message.channel
    .awaitMessages((m) => m.author.id === member.id, {
      max: 1,
      time: 180000,
      errors: ["time"],
    })
    .then((collected) => {
      if (collected.first().content === result) {
        member.send(`認証が完了しました！`);
        member.roles.add(target.authRole);
      } else {
        collected.first().reply("コードが間違っています！");
      }
    })
    .catch(() => {
      member.send(`時間切れです...`);
    });
});

client.on("message", async (message: Message) => {
  client.emit("checkMessage", message);
  if (message.author.bot || !(message.channel instanceof TextChannel)) return;
  if (message.content.match(/discord.gg\/(.+?)/)) {
    const reaction = await message.react(":wastebaslet:");
    message
      .awaitReactions(
        (r, u) =>
          r.emoji.name === ":wastebaslet:" && u.member.premissions.has("ADMIN"),
        {
          max: 1,
          time: 180000,
          errors: ["time"],
        }
      )
      .then(() => message.delete())
      .catch(() => reaction.remove());
  }
  Object.keys(words).map((w) => {
    if (message.content.includes(w)) message.channel.send(words[w]);
  });
  const tGuild = gs.find((g) => g.gid === message.guild.id);
  if (!tGuild?.noLinkOpen?.includes(message.channel.id)) {
    const re = new RegExp(
      "https://discord.com/channels/([0-9]{18})/([0-9]{18})/([0-9]{18})"
    );
    const results = message.content.match(re);
    if (results) {
      const channelId = results[2];
      const messageId = results[3];
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        channel.messages
          .fetch(messageId)
          .then(async (res) => {
            await message.channel.send(
              new NoobsEmbed()
                .setColor("ffffff")
                .setAuthor(res.author.tag, res.author.displayAvatarURL())
                .setDescription(res.content ? res.content : "")
                .setImage(
                  res.attachments ? res.attachments.map((a) => a.url)[0] : null
                )
                .setFooter(
                  `${res.guild.name} | ${res.channel.name}`,
                  res.guild.iconURL()
                )
                .setTimestamp(res.createdAt)
            );
          })
          .catch(message.reply);
      }
    }
  }

  if (!message.channel?.nsfw && message.attachments.size) {
    const attachment = message.attachments.first();
    if (!attachment.height && !attachment.width) return;

    const width = attachment.width;
    const height = attachment.height;
    const image = new Image();
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    image.src = attachment.url;
    image.onload = () => {
      ctx.drawImage(image, 0, 0, width, height);
      nsfwjs
        .classify(canvas as any)
        .then((result) => result[0])
        .then((result) => {
          if (result.className === "Neutral" || result.className === "Drawing")
            return;
          message
            .delete()
            .then((msg: Message) => {
              msg.channel.send(
                new NoobsEmbed()
                  .setColor("RED")
                  .setDescription(
                    `${message.author.tag} が送信した画像に不適切な内容が含まれている可能性があるため削除しました。`
                  )
                  .addField("多く含まれていた要素", result.className)
                  .addField(
                    "不適切な画像である確率",
                    `${Math.round(result.probability * 100)}%`
                  )
              );
            })
            .catch(console.error);
        })
        .catch(console.error);
    };
    image.onerror = (err) => console.error(err);
  }
});

client
  .command("help", async (msg: Message) => {
    await msg.channel.send(
      new NoobsEmbed()
        .setTitle("Security Help Board")
        .addField("Commands", [...client.commands.keys()].join(", "))
        .addField("開発者 AI Avalon")
    );
  })
  .command("ping", async (msg: Message) => {
    await msg.reply(
      new NoobsEmbed()
        .setColor("ffffff")
        .setTitle("PING情報")
        .addField("Bot Ping", `${Date.now() - Number(msg.createdAt)}ms`)
        .addField("WebSocket Ping", `${client.ws.ping}ms`)
    );
  })
  .command("setup", async (msg: Message, args: string[]) => {
    if (!msg.guild) return;
    const narid = await msg.guild.roles.create({data: {name: "未認証"}});
    const atrid = await msg.guild.roles.create({data: {name: "認証メンバー"}});

    const settings = {
      gid: msg.guild.id,
      noAuthRole: narid.id,
      authRole: atrid.id,
      noLinkOpen: [],
    };

    gs.push(settings);

    await save("./guildSetting", gs);

    await msg.reply(new NoobsEmbed().setDescription("設定が完了しました！"));
  })
  .command("link", async (msg: Message, args: string[]) => {
    const target = searchG(msg.guild.id);
    msg.mentions.channels.map((ch) => {
      target.noLinkOpen.push(ch.id);
    });
    await msg.reply("設定が完了しました！");
  })
  .command(
    "eval",
    async (msg: Message, args: string[]) => {
      try {
        const res = inspect(await eval(args.join(" ")));
        sendFormat(res);
      } catch (e) {
        sendFormat(String(e));
      }
      async function sendFormat(content) {
        if (content.length > 1500) {
          await msg.channel.send(
            "実行結果が長すぎるためファイルで送信します。",
            new MessageAttachment(Buffer.from(content), "result.txt")
          );
        } else {
          await msg.channel.send(content);
        }
      }
    },
    {
      practicable: ["691160715431772160"],
    }
  );
