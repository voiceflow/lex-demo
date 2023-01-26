import {
  PutIntentRequest,
  PutSlotTypeRequest,
} from "aws-sdk/clients/lexmodelbuildingservice";

export type LexV1Intent = PutIntentRequest & {
  slotTypes: PutSlotTypeRequest[];
};
