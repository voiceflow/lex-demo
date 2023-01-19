// view the README.md file for additional instructions

import {
  LexRuntimeServiceClient,
  PostTextCommand,
} from "@aws-sdk/client-lex-runtime-service";
import { Request } from "@voiceflow/base-types";
import { cli } from "cli-ux";
import { color } from "./utils";
import { BOT_PREFIX } from "./vf";

const LEX_BOT_NAME = process.env.LEX_BOT_NAME;
const LEX_BOT_ALIAS = process.env.LEX_BOT_ALIAS;

const lexClient = new LexRuntimeServiceClient({});

export const postText = async (
  userID: string,
  query: string
): Promise<Request.IntentRequest> => {
  let response = await lexClient.send(
    new PostTextCommand({
      botAlias: LEX_BOT_ALIAS,
      botName: LEX_BOT_NAME,
      userId: userID,
      inputText: query,
      activeContexts: [],
    })
  );

  while (response.slotToElicit) {
    console.log(BOT_PREFIX, response.message);
    const nextInput = await cli.prompt(color("[user]"));

    response = await lexClient.send(
      new PostTextCommand({
        botAlias: LEX_BOT_ALIAS,
        botName: LEX_BOT_NAME,
        userId: userID,
        inputText: nextInput,
      })
    );
  }

  // resolve to Voiceflow None Intent: https://github.com/voiceflow/libs/blob/master/packages/voiceflow-types/src/constants/intent.ts#L15
  if (!response.intentName) response.intentName === "None";

  return {
    type: Request.RequestType.INTENT,
    payload: {
      intent: {
        name: response.intentName,
      },
      query,
      entities: Object.entries(response.slots || []).map(([name, value]) => ({
        name,
        value,
      })),
      confidence: response.nluIntentConfidence?.score,
    },
  };
};
