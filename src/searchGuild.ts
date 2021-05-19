import * as settings from "./guildSetting.json";

export interface guildConfig {
  gid: string;
  noAuthRole: string;
  authRole: string;
  noLinkOpen: string[];
}

export function searchG(gid): guildConfig {
  const res = settings.find((g) => g.gid === gid);
  return res as guildConfig;
}
