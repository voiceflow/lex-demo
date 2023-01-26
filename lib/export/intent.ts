import { getUtterancesWithSlotNames, Utils } from "@voiceflow/common";
import { BaseModels } from "@voiceflow/base-types";
import {
  PutSlotTypeRequest,
  Slot as LexIntentSlot,
} from "aws-sdk/clients/lexmodelbuildingservice";

import {
  sanitizeResourceName,
  getAmazonIntentName,
  isCustomType,
  promptToString,
} from "./utils";

import { LexV1Intent } from "./types";

export const voiceflowToLexIntent = (
  intent,
  slotsByID: Map<string, BaseModels.Slot>
): LexV1Intent => {
  const slots = Array.from(slotsByID.values());

  return {
    name: sanitizeResourceName(Utils.intent.cleanVFIntentName(intent.name)),
    description: "",
    fulfillmentActivity: {
      type: "ReturnIntent",
    },
    parentIntentSignature: getAmazonIntentName(intent.name),
    sampleUtterances: getUtterancesWithSlotNames({
      slots,
      utterances: intent.inputs,
    }),
    slots: (intent.slots || []).map((intentSlot, index): LexIntentSlot => {
      const entity = slotsByID.get(intentSlot.id);
      const prompts = intentSlot.dialog.prompt
        .map(promptToString)
        .filter(Boolean)
        .map((prompt) => ({ contentType: "PlainText", content: prompt }));

      return {
        name: entity.name,
        sampleUtterances: getUtterancesWithSlotNames({
          slots,
          utterances: intentSlot.dialog.utterances,
        }),
        slotType: isCustomType(entity.type.value)
          ? entity.name
          : entity.type.value,
        obfuscationSetting: "NONE",
        description: entity.name,
        slotConstraint: intentSlot.required ? "Required" : "Optional",
        valueElicitationPrompt: prompts.length
          ? {
              messages: prompts,
              maxAttempts: 2,
            }
          : undefined,
        priority: index + 1,
      };
    }),
    slotTypes: Utils.array
      .inferUnion<any[]>(intent.slots || [])
      .filter(({ id }) => isCustomType(slotsByID.get(id)?.type.value))
      .map(({ id }): PutSlotTypeRequest => {
        const entity = slotsByID.get(id);

        return {
          name: entity.name,
          enumerationValues: entity.inputs.map((input) => {
            const [firstSample, ...samples] =
              Utils.slot.getUniqueSamples(input);
            return {
              value: firstSample,
              synonyms: samples ?? [],
            };
          }),
          valueSelectionStrategy: "TOP_RESOLUTION",
        };
      }),

    conclusionStatement: { messages: [] },
  };
};
