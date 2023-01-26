import JSZip from "jszip";

import { LexV1Intent } from "./types";

export const createIntentZip = (lexIntent: LexV1Intent) => {
  return JSZip().file(
    `${lexIntent.name}.json`,
    JSON.stringify({
      metadata: {
        schemaVersion: "1.0",
        importType: "LEX",
        importFormat: "JSON",
      },
      resource: lexIntent,
    })
  );
};

export const zipIntents = (lexIntents: LexV1Intent[]) => {
  return lexIntents.reduce(
    (zip, lexIntent) =>
      zip.file(
        `${lexIntent.name}.zip`,
        createIntentZip(lexIntent).generateNodeStream()
      ),
    JSZip()
  );
};
