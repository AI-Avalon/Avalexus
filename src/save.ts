import * as fs from "fs";
import * as path from "path";

export default function save(target: string, val: Array<object>) {
  fs.writeFile(path.join(__dirname, target), JSON.stringify(val), (e) => {
    if (e) console.log(e);
  });
}
