import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14, MODEL, TEMPERATURE } from "../../../src/constants";
import type { ChatCompletionMessageParam } from "openai/src/resources/chat/index.js";

export async function correctCode(
  client: OpenAI,
  refactoredCode: string,
  options?: {
    drizzleSchema?: string,
    apiCode?: string,
    parentComponent?: string,
    parentComponentName?: string,
    componentName?: string
  }
): Promise<string> {
  console.log("Step Bonus: Correcting Code...");
  const messages = [
    {
      role: "system",
      content: `
        You are a Code Assistant. Your function is to ensure the code provided works perfectly.
        Use Typescript syntax.
        Use Drizzle ORM syntax. 

        Add this line at the top of the file when using useState, useEffect, etc.
        
        "use client"

        Next.js 14 examples:
        ${DATA_FETCHING_NEXT_14}
      `
    },
    {
      role: "user",
      content: `React Component: ${refactoredCode}`
    }
  ];

  if (options?.drizzleSchema) {
    messages.push({
      role: "user",
      content: `Drizzle Schema: ${options.drizzleSchema}`
    });
  }

  if (options?.apiCode) {
    messages.push({
      role: "user",
      content: `API: ${options.apiCode}`
    });
  }

  if (options?.parentComponent) {
    messages.push({
      role: "user",
      content: `Parent Component: ${options.parentComponent}`
    });
  }

  messages.push({
    role: "user",
    content: `
      Based on the provided information, ensure the code works perfectly.
      
      ${options?.parentComponentName && options?.componentName ? `
      📦 <project root>
      └ 📂 app
          └ 📂 ${options.parentComponentName}
              └ 📜 page.tsx
          └ 📂 api
              └ 📂 ${options.parentComponentName}
                  └ 📜 route.ts
      └ 📂 components
          └ 📜 ${options.componentName}.tsx
      └ 📂 db
          └ 📜 schema.ts
      ` : ''}
    `
  });

  messages.push({
    role: "user",
    content: `
      Output the code for React Component${options?.drizzleSchema ? ', Drizzle Schema' : ''}${options?.apiCode ? ', API' : ''}${options?.parentComponent ? ', and Parent Component' : ''} in a single response in a JSON format.
      Example:
      {
        "reactComponent": "...",
        ${options?.drizzleSchema ? '"drizzleSchema": "...",' : ''}
        ${options?.apiCode ? '"api": "...",' : ''}
        ${options?.parentComponent ? '"parentComponent": "..."' : ''}
      }

      Don't include \`\`\`tsx or \`\`\`javascript in your code response.
    `
  });

  const correctedCode = await client.chat.completions.create({
    model: MODEL,
    messages: messages as ChatCompletionMessageParam[],
    temperature: TEMPERATURE
  });

  const code = correctedCode.choices[0].message.content ?? '';
  console.log(`Correct code generated: ${code}`);
  return code;
}