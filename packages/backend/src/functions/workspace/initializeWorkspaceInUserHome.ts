import { promises as fs } from "fs";
import { homedir } from "os";
import path from "path";

export async function initializeWorkspaceInUserHome(): Promise<string> {
  let projectRoot;
  if (process.env.PROJECT_USERNAME) {
    const dir = path.join(
      homedir(),
      "..",
      process.env.PROJECT_USERNAME,
      process.env.PROJECT_DIRECTORY
    );
    projectRoot = dir;
    await fs.mkdir(dir, { recursive: true });
  } else {
    const dir = path.join(homedir(), process.env.PROJECT_DIRECTORY);
    projectRoot = dir;
    await fs.mkdir(dir, { recursive: true });
  }
  return projectRoot;
}
