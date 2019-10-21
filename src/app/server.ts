import * as path from "path";
import { ISettings } from "./../interfaces/settings.interface";
import { executeCommand } from "./commands";

export const initializeServer = async (
  settings: ISettings
): Promise<(text: string) => void> => {
  console.log("updating steamcmd app");
  /*await executeCommand(
    "steamcmd.exe",
    ["+login anonymous", "+app_update 343050  validate", "+quit"],
    settings.steamCmdLocation
  );*/

  const kleiFolderLocation = path.join(settings.serverFilesLocation, "../..");
  const dedicatedServerNullRenderLocation = path.join(
    settings.steamCmdLocation,
    "steamapps/common/Don't Starve Together Dedicated Server/bin/dontstarve_dedicated_server_nullrenderer.exe"
  );
  console.log("starting master");
  let sendTextToMaster;
  const masterConsole = await executeCommand(
    "start_master.bat",
    ["-console", "-cluster MyDediServer", "-shard Master"],
    kleiFolderLocation,
    sendTextToMaster
  );
  const cavesConsole = await executeCommand(
    "start_caves.bat",
    ["-console", "-cluster MyDediServer", "-shard Master"],
    kleiFolderLocation,
    sendTextToMaster
  );
  return masterConsole;
  /*console.log("starting caves");
  const cavesConsole = await executeCommand(
    dedicatedServerNullRenderLocation,
    ["-console", "-cluster MyDediServer", "-shard Caves"],
    kleiFolderLocation
  );*/
};
