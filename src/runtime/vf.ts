import axios from "axios";
import { color } from "./utils";

const baseURL = process.env.VF_RUNTIME_ENDPOINT;
const Authorization = process.env.VF_DM_API_KEY;

if (!Authorization) throw new Error("Missing Voiceflow API Key");
if (!baseURL) throw new Error("Missing Voiceflow Runtime Endpoint");

const runtimeClient = axios.create({
  baseURL,
  headers: { Authorization },
});

export const BOT_PREFIX = color("[bot]", 35) + ":";

// send an interaction to the Voiceflow API, and log the response, returns true if there is a next step
export const interact = async (userID, request) => {
  // call the Voiceflow API with the user's name & request, get back a response
  const response = await runtimeClient({
    method: "POST",
    url: `/state/user/${userID}/interact`,
    data: { request },
  });

  // loop through the response
  for (const trace of response.data) {
    switch (trace.type) {
      case "text":
      case "speak": {
        console.log(BOT_PREFIX, trace.payload.message);
        break;
      }
      case "end": {
        // an end trace means the the Voiceflow dialog has ended
        return false;
      }
    }
  }

  return true;
};
