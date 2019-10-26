export interface ISettings {
  serverFilesLocation: string;
  steamCmdLocation: string;
  online: boolean;
  bot: {
    channels: string[];
    ignoreChannels: string[];
  };
}
