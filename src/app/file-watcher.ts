import { Subject } from "rxjs";
import { Observable } from "rxjs";
import * as fs from "fs";
import md5 from "md5";
import { readContent } from "./settings";

export interface IFileChange {
  stamp: Date;
  lines: Array<string>;
}
export const watchFileChanges = (
  initialContent: string,
  filePath: string
): Observable<IFileChange> => {
  const fileChangesSubject = new Subject<IFileChange>();
  console.log(`Watching for file changes on ${filePath}`);
  let md5Previous: string;
  let fsWait = false;
  let previousContent = initialContent;
  fs.watch(filePath, async (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = true;
      setTimeout(() => {
        fsWait = false;
      }, 500);
      console.log("watching");
      const md5Current = md5(fs.readFileSync(filePath));
      if (md5Current === md5Previous) {
        return;
      }
      md5Previous = md5Current;
      const newContent = await readContent(filePath);
      const filteredContent = newContent.replace(previousContent, "");
      fileChangesSubject.next({
        stamp: new Date(),
        lines: newContent.replace(previousContent, "").split(/\r\n/);
      });
      previousContent = newContent;
    }
  });
  return fileChangesSubject;
};