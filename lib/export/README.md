# EXPORT: Voiceflow Project to Lex V1 Bot

Please note that this codebase only works for the V1 version of Amazon Lex.

This is a demonstration of translating a Voiceflow project into parameters for a Lex Bot or any other format.

### Setup

Create a Voiceflow project that has intent events and output steps following it (speak, text, or card steps).
Export the Voiceflow project as a (.vf) file.

![Screen Shot 2023-01-26 at 5 18 36 PM](https://user-images.githubusercontent.com/5643574/214963509-9c5a9b33-d069-41af-9729-1117ac436a2c.png)

You can leave this file where convenient (~/Desktop, ~/Downloads, ~/Documents etc.).

[NodeJS](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) are required.

On the root level of this repository,

1. execute `npm install` to install all dependencies
2. execute `npm run export [PATH TO FILE]`

where `[PATH TO FILE]` is where the .vf file was saved earlier.
If the file was called `project.vf` was on my Desktop, it would be `npm run export ~/Desktop/project.vf`

This will produce a `.zip` file with the same name, for example `project.vf` -> `project.zip`. This file contains various intents that can be added to the Lex bot.
