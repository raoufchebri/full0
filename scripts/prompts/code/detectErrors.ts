import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14, MODEL, TEMPERATURE } from "../../../src/constants";
import type { ChatCompletionMessageParam } from "openai/src/resources/chat/index.js";

interface File {
  content: string,
  path: string,
}

export async function detectErrors(
  client: OpenAI,
  refactoredCode: string,
  options?: {
    drizzleSchema: File,
    apiCode: File,
    mainComponent: File,
    dataFetchingComponent?: File,
  }
): Promise<string> {
  console.log("Step Bonus: Correcting Code...");
  const messages = [
    {
      role: "user",
      content: `
        You are a Code Error Detection Assistant. Your function is to detect errors in the code provided.
        Use Typescript syntax.
        Use Drizzle ORM syntax. 
      `
    },
    {
      role: "user",
      content: `
      React Component: 
      _____________________
      // ${options?.mainComponent.path}

      ${options?.mainComponent.content}
      `
    }
  ];

  if (options?.drizzleSchema) {
    messages.push({
      role: "user",
      content: `Drizzle Schema: 
      _____________________
      // ${options?.drizzleSchema.path}
      
      ${options?.drizzleSchema.content}
      `
    });
  }

  if (options?.apiCode) {
    messages.push({
      role: "user",
      content: `API: 
      _____________________
      // ${options?.apiCode.path}
      
      ${options?.apiCode.content}
      `
    });
  }

  if (options?.dataFetchingComponent) {
    messages.push({
      role: "user",
      content: `Parent Component: 
      _____________________
      // ${options?.dataFetchingComponent.path}
      
      ${options?.dataFetchingComponent.content}
      `
    });
  }

  messages.push({
    role: "user",
    content: `
      Based on the provided information, detect errors in the code.
    `
  });

  messages.push({
    role: "user",
    content: `
    ## Output in JSON format.
      {
        "drizzle-schema": {
          "overview": "string",
        },
        "main-react-component": {
          "overview": "string"
        },
        "api-route": {
          "overview": "string",
        },
        "data-fetching-logic": {
          "overview": "string"
        },
      }

      If no errors are detected, reply with an empty JSON object.
    `
  });

  const correctedCode = await client.chat.completions.create({
    model: "o1-preview",
    messages: messages as ChatCompletionMessageParam[],
    temperature: TEMPERATURE
  });

  const code = correctedCode.choices[0].message.content ?? '';
  console.log(`Correct code generated: ${code}`);
  return code;
}