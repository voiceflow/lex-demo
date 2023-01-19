// view the README.md file for additional instructions
import * as dotenv from "dotenv";
dotenv.config();

import { cli } from "cli-ux";
import { Request } from "@voiceflow/base-types";

import * as Voiceflow from "./vf";
import * as Lex from "./lex";

import { color, isAlphaNumeric } from "./utils";

async function main() {
  let userID;
  while (!userID) {
    userID = await cli.prompt(color("> What is your name?"));

    if (!isAlphaNumeric(userID)) {
      console.log(color("> names must be alphanumeric"), color(userID, 31));
      userID = undefined;
    }
  }

  // send a simple launch request starting the dialog, initialize lex session
  let isRunning = await Voiceflow.interact(userID, {
    type: Request.RequestType.LAUNCH,
  });

  while (isRunning) {
    const nextInput = await cli.prompt(color("[user]"));

    console.log(Voiceflow.BOT_PREFIX, "...");

    // resolve text to an intent via lex
    const intent = await Lex.postText(userID, nextInput);

    // send resolved intent to Voiceflow
    isRunning = await Voiceflow.interact(userID, intent);
  }

  console.log(color("> The end! Start me again with `npm start`", 32));
}

main();
