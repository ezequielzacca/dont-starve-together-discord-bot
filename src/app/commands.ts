import { spawn, ChildProcess } from "child_process";
export const executeCommand = (
  command: string,
  args: string[],
  cwd?: string
): Promise<(text: string) => void> => {
  return new Promise((resolve, reject) => {
    const spawnedCmd = spawn(command, args, {
      cwd: cwd,
      stdio: ["pipe", process.stdout, process.stderr]
    });
    const send = (text: string) => {
      spawnedCmd.stdin.write(`${text}\r\n`);
    };
    resolve(send);
  });
};
