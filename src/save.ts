import { promises as fs } from "fs";
import * as path from "path";

export default async function save(target: string, val: Array<object>) {
  await fs.writeFile(path.join(__dirname, target), JSON.stringify(val, null, 2))
  .catch(console.log);
}
