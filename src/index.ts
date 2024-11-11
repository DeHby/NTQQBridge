////////////////////////////////////////
import path from "path";
module.paths.push(path.join(__dirname, "../"));

///////////////////////////////////////
import * as dotenv from "dotenv";
import moduleAlias from "module-alias";
import { readFileSync } from "fs";

moduleAlias.addAlias("@", __dirname);
dotenv.config();

import "@/dev/pipe-logger";
////////////////////////////////////////
import { WrapperSession } from "@/ntqq-loader";
import { log } from "console";

function main() {
  {
    globalThis.msgService = WrapperSession;
    let lastDebugCode: string = "";
    setInterval(() => {
      const code = readFileSync(path.join(__dirname, "/dev/hot-script.js"), {
        encoding: "utf8",
      });
      if (code == lastDebugCode) return;
      lastDebugCode = code;
      try {
        eval(code);
      } catch (error: any) {
        console.log(error);
      }
    }, 1000);
  }
}

try {
  if (process.env.TEST) {
    require("@/dev/test");
  } else {
    main();
  }
} catch (error) {
  log(error);
}
