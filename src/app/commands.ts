import { spawn, ChildProcess } from "child_process";
export const executeCommand = (
  command: string,
  args: string[],
  cwd?: string,
  resolveOnEnd: boolean = false
): Promise<(text: string) => void> => {
  return new Promise((resolve, reject) => {
    const spawnedCmd = spawn(command, args, {
      cwd: cwd,
      stdio: ["pipe", process.stdout, process.stderr]
    });
    const send = (text: string) => {
      spawnedCmd.stdin.write(`${text}\r\n`);
    };
    if (!resolveOnEnd) {
      resolve(send);
    } else {
      spawnedCmd.on("exit", code => {
        if (code == 0) {
          resolve(send);
        } else {
          reject(code);
        }
      });
    }
  });
};
