import { REST } from "@discordjs/rest";
import {
  RESTPostAPIChannelMessageResult,
  RESTPostAPICurrentUserCreateDMChannelResult,
  Routes,
  APIEmbed,
} from "discord-api-types/v10";

export class DiscordClient {
  private rest: REST;
  private DISCORD_USER_ID = process.env.DISCORD_USER_ID ?? "";

  constructor() {
    this.rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_BOT_TOKEN ?? ""
    );
  }

  private async createDM() {
    return this.rest.post(Routes.userChannels(), {
      body: { recipient_id: this.DISCORD_USER_ID },
    }) as Promise<RESTPostAPICurrentUserCreateDMChannelResult>;
  }

  async sendEmbed(embed: APIEmbed) {
    const channel = await this.createDM();

    const res = this.rest.post(Routes.channelMessages(channel.id), {
      body: { embeds: [embed] },
    });

    return res as Promise<RESTPostAPIChannelMessageResult>;
  }
}
