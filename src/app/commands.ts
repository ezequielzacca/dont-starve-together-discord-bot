import { spawn, ChildProcess } from "child_process";
export const executeCommand = (
  command: string,
  args: string[],
  cwd?: string,
  send?: (text: string) => void
): Promise<(text: string) => void> => {
  return new Promise((resolve, reject) => {
    const spawnedCmd = spawn(command, args, {
      cwd: cwd,
      stdio: ["pipe", process.stdout, process.stderr]
    });

    spawnedCmd.on("error", console.log);
    spawnedCmd.on("data", console.log);
    send = (text: string) => {      
      spawnedCmd.stdin.write(`${text}\r\n`);
    };
    resolve(send);
  });
};
