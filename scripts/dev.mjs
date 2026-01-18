import { spawn } from "node:child_process";

const apiEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "sqlite:./data/amigo.db",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  WEB_BASE_URL: process.env.WEB_BASE_URL || "http://localhost:3001",
};

const commands = [
  {
    name: "api",
    cmd: "pnpm",
    args: ["run", "dev:api"],
    env: apiEnv,
  },
  {
    name: "web",
    cmd: "pnpm",
    args: ["run", "dev:web"],
    env: process.env,
  },
];

let shuttingDown = false;
const procs = commands.map(({ cmd, args, env }) =>
  spawn(cmd, args, { stdio: "inherit", env })
);

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const proc of procs) {
    if (proc && !proc.killed) {
      proc.kill("SIGINT");
    }
  }
  process.exit(code);
};

for (const proc of procs) {
  proc.on("exit", (code) => {
    if (typeof code === "number" && code !== 0) {
      shutdown(code);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
