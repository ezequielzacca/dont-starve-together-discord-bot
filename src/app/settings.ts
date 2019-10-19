import { ISettings } from "./../interfaces/settings.interface";
import * as fs from "fs";
import * as path from "path";

export const settings = (): Promise<ISettings> => {
  return new Promise(async (resolve, reject) => {
    const settingsFilePath = path.join(__dirname, "../settings.json");
    try {
      const jsonContent = JSON.parse(await readContent(settingsFilePath));
      return resolve(jsonContent);
    } catch (e) {
      return reject(e);
    }
  });
};

export const readContent = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};
