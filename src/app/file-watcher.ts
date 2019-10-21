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
  setInterval(async () => {
    const newContent = await readContent(filePath);
    const filteredContent = newContent.replace(previousContent, "");
    fileChangesSubject.next({
      stamp: new Date(),
      lines: newContent.replace(previousContent, "").split(/\r\n/)
    });
    previousContent = newContent;
  }, 3000);
  return fileChangesSubject;
};
