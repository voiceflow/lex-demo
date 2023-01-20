import { AlexaConstants } from "@voiceflow/alexa-types";
import { VoiceflowConstants, VoiceflowUtils } from "@voiceflow/voiceflow-types";
import { serializeToText } from "@voiceflow/slate-serializer/text";
import { BaseText } from "@voiceflow/base-types";
import { isVariableElement } from "@voiceflow/slate-serializer";
import { Element } from "slate";
import { SLOT_REGEXP } from "@voiceflow/common";
import { transliterate } from "transliteration";

export const sanitizeResourceName = (name: string): string =>
  // Try our best to keep the sanitized name close to the original
  transliterate(name)
    .replaceAll(" ", "_")
    .replace(/[^_a-z]/gi, "")
    .trim();

export const extractVariables = (content?: string): string => {
  if (!content?.trim?.()) return "";
  return content.replace(SLOT_REGEXP, "{$1}");
};

// transform SSML string with voice
const createSSML = (text: string, voice?: unknown): string => {
  const content = extractVariables(text);

  if (voice === VoiceflowConstants.Voice.AUDIO)
    return `<audio src="${content}"/>`;
  if (!voice || voice === VoiceflowConstants.Voice.DEFAULT) return content;

  return voice ? `<voice name="${voice}">${content}</voice>` : content;
};

const AdditionalVoiceflowToAmazonSlotMap = {
  [VoiceflowConstants.SlotType.GEOGRAPHY]: "AMAZON.StreetAddress",
};

export const getAmazonSlotType = (slotType: string): string =>
  AlexaConstants.VoiceflowToAmazonSlotMap[
    slotType as VoiceflowConstants.SlotType
  ] ||
  AdditionalVoiceflowToAmazonSlotMap[slotType] ||
  slotType;

export const getAmazonIntentName = (intentName: string): string | undefined =>
  AlexaConstants.VoiceflowToAmazonIntentMap[
    intentName as VoiceflowConstants.IntentName
  ];

export const isCustomType = (slotType: string): boolean =>
  slotType.toUpperCase() === AlexaConstants.IntentPrefix.CUSTOM;

export type SanitizedPrompt = string | BaseText.SlateTextValue | undefined;

/** @description if contents of prompt is empty with trim */
export const isPromptEmpty = (
  prompt?: VoiceflowUtils.prompt.AnyPrompt | null
): prompt is null | undefined => {
  if (VoiceflowUtils.prompt.isChatPrompt(prompt))
    return !serializeToText(prompt.content, { encodeVariables: false }).trim();
  if (VoiceflowUtils.prompt.isVoicePrompt(prompt))
    return !prompt.content?.trim();
  if (VoiceflowUtils.prompt.isIntentVoicePrompt(prompt))
    return !prompt.text?.trim();

  return true;
};

export const transformSlateVariables = (
  value: BaseText.SlateTextValue
): BaseText.SlateTextValue =>
  value.map((node) => {
    if (Element.isElement(node)) {
      return isVariableElement(node)
        ? { text: `{${node.name}}` }
        : { ...node, children: transformSlateVariables(node.children) };
    }

    return node;
  });

// convert prompts into intermediate formats.
// It's okay to have whitespace, but not pure whitespace (i.e. ' hello ' vs ' ')
export const sanitizePrompt = (
  prompt?: VoiceflowUtils.prompt.AnyPrompt | null
): SanitizedPrompt => {
  if (isPromptEmpty(prompt)) return undefined;

  if (VoiceflowUtils.prompt.isChatPrompt(prompt))
    return transformSlateVariables(prompt.content);
  if (VoiceflowUtils.prompt.isVoicePrompt(prompt))
    return createSSML(prompt.content, prompt.voice);
  if (VoiceflowUtils.prompt.isIntentVoicePrompt(prompt))
    return createSSML(prompt.text, prompt.voice);

  return undefined;
};

export const promptToString = (
  prompt?: VoiceflowUtils.prompt.AnyPrompt | null
): string => {
  const sanitizedPrompt = sanitizePrompt(prompt);

  if (typeof sanitizedPrompt === "string") return sanitizedPrompt;

  return serializeToText(sanitizedPrompt ?? [], { encodeVariables: false });
};
