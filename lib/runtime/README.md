# RUNTIME: Lex V1 NLU + Voiceflow Runtime

Please note that this codebase only works for the V1 version of Amazon Lex

### Setup

Copy and paste the `.example.env` file and rename it to `.env`
Fill out all the fields. For additional info:

`LEX_BOT_NAME`: name of the bot on lex
![Screen Shot 2023-01-19 at 3 05 43 AM](https://user-images.githubusercontent.com/5643574/213387727-4bcb2b4e-6d39-4359-bf56-bb0b9315e2a0.png)

`LEX_BOT_ALIAS`: alias for particular versions of the bot on lex
![Screen Shot 2023-01-19 at 3 07 05 AM](https://user-images.githubusercontent.com/5643574/213387940-8a2c50eb-d10a-4b35-8fee-b1ab7c553d32.png)

`VF_DM_API_KEY`: an API key specific to an assistant (project) on Voiceflow
![Screen Shot 2023-01-19 at 3 07 56 AM](https://user-images.githubusercontent.com/5643574/213388075-33ddaa5a-5791-45b5-9a4e-7567c1c152af.png)

The file would look something like this:

```
VF_RUNTIME_ENDPOINT = 'https://general-runtime.voiceflow.com'
VF_DM_API_KEY = 'VF.DM.XXXXX.........'

LEX_BOT_NAME = 'BookTrip'
LEX_BOT_ALIAS = 'development'
```

You will also need to set up AWS credentials on your computer. [[documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)].
This would mean that there is a `~/.aws/credentials` and `~/.aws/config` on your local computer corresponding to an IAM profile.

You will need to run the Voiceflow assistant as a prototype at least once, and run it whenever an update is needed.
![Screen Shot 2023-01-19 at 3 11 06 AM](https://user-images.githubusercontent.com/5643574/213388675-48c87ded-881f-4f07-a5c9-5f310117a206.png)

All intents and entities (slots) on the Voiceflow assistant can be exported in a Lex V1 format:
![Screen Shot 2023-01-19 at 3 14 35 AM](https://user-images.githubusercontent.com/5643574/213389349-aa707bf2-1c6a-4d9a-a5a1-582a5c6a799a.png)

These intents can be subsequently imported into the Lex V1 bot.

Run `npm install` in this folder once to install all dependencies.

Run `npm run start` to begin the test.
