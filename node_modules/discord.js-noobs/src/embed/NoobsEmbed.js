const { MessageEmbed, Collection } = require("discord.js");

class NoobsEmbed extends MessageEmbed {
  #client;
  #book;
  #page;
  constructor(config = {}) {
    super(config.embed ?? {});
    this.#client = config.client;

    if (config.type === "book") {
      this.handlers = new Collection();
      this.pages = new Collection();
      this.#page = 0;

      const edit = (target, { reaction, user }) => {
        const embed = this.pages.get(target);

        if (!embed) {
          reaction.users.remove(user).catch(console.error);

          return;
        }

        this.#page = target;

        reaction.message
          .edit(embed)
          .then(() => reaction.users.remove(user))
          .catch(console.error);
      };

      this.addReactionHandler("◀", (reaction, user) => {
        edit(this.#page - 1, { reaction, user });
      })
        .addReactionHandler("▶", (reaction, user) => {
          edit(this.#page + 1, { reaction, user });
        })
        .addReactionHandler("⏹", (reaction) => {
          this.#book?.stop();
          reaction.message.reactions.removeAll().catch(console.error);
        });
    }
  }
  addPage(embed = new MessageEmbed()) {
    this.pages.set(this.pages.size, embed);
    return this;
  }
  addPages(embeds = []) {
    if (embeds.length) embeds.map((e) => this.pages.set(this.pages.size, e));
    return this;
  }
  addReactionHandler(emoji, fn) {
    const target = this.#client.emojis.resolveIdentifier(emoji);
    this.handlers.set(decodeURI(target), fn);
    return this;
  }
  async send(config = {}) {
    const { msg, options } = config;
    const filter = (reaction, user) =>
      this.handlers.has(decodeURI(reaction.emoji.identifier)) &&
      user.id === msg.author.id;

    const collect = (reaction, user) => {
      const fn = this.handlers.get(decodeURI(reaction.emoji.identifier));
      if (fn) {
        reaction.users.remove(user).catch(console.error);

        return fn(reaction, user);
      }
    };

    const end = () => msg.reactions.removeAll().catch(console.error);

    this.#book = await msg.channel
      .send(this.pages.first())
      .then((msg) => msg.createReactionCollector(filter, options))
      .then((collector) => collector.on("collect", collect))
      .then((collector) => collector.on("end", end));

    return Promise.all(
      [...this.handlers.keys()].map(async (e) => this.#book?.message?.react(e))
    );
  }
}

module.exports = NoobsEmbed;
