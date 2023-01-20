import { BaseModels, BaseNode } from "@voiceflow/base-types";
import { VoiceNode } from "@voiceflow/voice-types";
import { LexV1Intent } from "./types";
import { promptToString } from "./utils";

type StepHandler<S extends BaseModels.BaseStep = BaseModels.BaseStep> = (
  step: S,
  lexIntent: LexV1Intent,
  context: { groupNumber: number }
) => string;

const IntentHandler: StepHandler<BaseNode.Intent.Step> = (step) => {
  return step.data.portsV2.builtIn?.next?.target;
};

const SpeakHandler: StepHandler<VoiceNode.Speak.Step> = (
  step,
  lexIntent,
  context
) => {
  lexIntent.conclusionStatement.messages.push(
    ...step.data.dialogs.map((prompt: any) => ({
      contentType: "PlainText",
      content: promptToString(prompt),
      groupNumber: context.groupNumber,
    }))
  );

  context.groupNumber += 1;

  return step.data.portsV2.builtIn?.next?.target;
};

const TextHandler: StepHandler<BaseNode.Text.Step> = (
  step,
  lexIntent,
  context
) => {
  lexIntent.conclusionStatement.messages.push(
    ...step.data.texts.map((prompt: any) => ({
      contentType: "PlainText",
      content: promptToString(prompt),
      groupNumber: context.groupNumber,
    }))
  );

  context.groupNumber += 1;

  return step.data.portsV2.builtIn?.next?.target;
};

const CardHandler: StepHandler<BaseNode.CardV2.Step> = (step, lexIntent) => {
  lexIntent.conclusionStatement.responseCard ??= JSON.stringify({
    version: 1,
    contentType: "application/vnd.amazonaws.card.generic",
    genericAttachments: [],
  });

  const responseCard = JSON.parse(lexIntent.conclusionStatement.responseCard);

  responseCard.genericAttachments.push({
    title: step.data.title,
    imageUrl: step.data.imageUrl,
    buttons: step.data.buttons.map((button) => ({
      text: button.name,
      value: button.name,
    })),
  });

  lexIntent.conclusionStatement.responseCard = JSON.stringify(responseCard);

  return step.data.portsV2.builtIn?.next?.target;
};

export const StepHandlerMap: Record<string, StepHandler> = {
  [BaseNode.NodeType.INTENT]: IntentHandler,
  [BaseNode.NodeType.SPEAK]: SpeakHandler,
  [BaseNode.NodeType.TEXT]: TextHandler,
  [BaseNode.NodeType.CARD_V2]: CardHandler,
};
