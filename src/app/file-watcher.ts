import { Subject } from "rxjs";
import { Observable } from "rxjs";
import * as fs from "fs";
import md5 from "md5";
import { readContent } from "./settings";

export interface IFileChange {
  lines: Array<string>;
}
export const watchFileChanges = (
  initialContent: string,
  filePath: string
): Observable<IFileChange> => {
  const fileChangesSubject = new Subject<IFileChange>();
  console.log(`Watching for file changes on ${filePath}`);
  let previousContent = initialContent;
  setInterval(async () => {
    const newContent = await readContent(filePath);
    const filteredContent = newContent.replace(previousContent, "");
    if (filteredContent !== "") {
      fileChangesSubject.next({
        lines: filteredContent.split(/\r\n/)
      });
    }
    previousContent = newContent;
  }, 3000);
  return fileChangesSubject;
};
