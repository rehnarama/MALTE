import { promises as fs } from "fs";
import { sep } from "path";
import os from "os";

export async function initializeRandomDirectory(): Promise<string> {
  const tmpDir = os.tmpdir();
  const projectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
  return projectRoot;
}
