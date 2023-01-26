import { VoiceflowDiagram } from "@voiceflow/voiceflow-types";
import { BaseModels, BaseNode } from "@voiceflow/base-types";
import fs from "fs";
import path from "path";
import { LexV1Intent } from "./types";
import { getSteps } from "./diagram";
import { voiceflowToLexIntent } from "./intent";
import { StepHandlerMap } from "./steps";
import { zipIntents } from "./zip";
import { getAmazonSlotType, sanitizeResourceName } from "./utils";

// get first parameter from command line
const [, , ...args] = process.argv;

const readFilePath = args[0] || "project.vf";
const { dir: readFileDirectory, name: readFileName } = path.parse(readFilePath);

console.log("\x1b[36m%s\x1b[0m", `Reading ${readFileName}`);

const content = JSON.parse(fs.readFileSync(readFilePath, "utf8"));
const {
  version: { platformData },
  diagrams,
} = content;

const intentMap = new Map<string, BaseModels.Intent>(
  platformData.intents.map((intent: BaseModels.Intent) => [intent.key, intent])
);

const slotMap = new Map<string, BaseModels.Slot>(
  platformData.slots.map((slot: BaseModels.Slot) => [
    slot.key,
    {
      ...slot,
      name: sanitizeResourceName(slot.name),
      type: { value: getAmazonSlotType(slot.type.value!) },
    },
  ])
);

const lexIntents: LexV1Intent[] = [];

Object.values(diagrams).forEach((diagram: VoiceflowDiagram.Diagram) => {
  const steps = getSteps(diagram);

  steps.forEach((step) => {
    // fetch all intent steps in the project
    if (step.type !== BaseNode.NodeType.INTENT || !step.data?.intent) return;

    const intent = intentMap.get(step.data.intent);
    if (!intent) return;

    const lexIntent = voiceflowToLexIntent(intent, slotMap);

    let nextStepID: string = step.nodeID;

    const context = { groupNumber: 1 };

    do {
      const nextStep = steps.get(nextStepID) as any;
      nextStepID = StepHandlerMap[nextStep?.type]?.(
        nextStep,
        lexIntent,
        context
      );
    } while (nextStepID);

    lexIntents.push(lexIntent);
  });
});

const exportFileName = `${readFileName}.zip`;
const writePathName = path.join(readFileDirectory, exportFileName);

zipIntents(lexIntents)
  .generateNodeStream({
    type: "nodebuffer",
    streamFiles: true,
  })
  .pipe(fs.createWriteStream(writePathName))
  .on("finish", () => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `Successfully exported intents to ${exportFileName}`
    );
  });
