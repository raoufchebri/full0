import { OpenAI } from "openai";
import chalk from "chalk";
import type { ChatCompletionMessageParam } from "openai/src/resources/chat/completions.js";

export async function identifyDynamicElements(client: OpenAI, componentCode: string, parentComponentName: string, componentName: string): Promise<any> {
  console.log(chalk.blue("🔍 Analyzing component structure..."));

  const initialMessages: ChatCompletionMessageParam[] = [
    {
        role: "user",
        content: `
        Describe the React Component located in @/components/${componentName}.tsx and its purpose.

        ## React Component
        ${componentCode}
        `
    },
  ];

  const reactComponentDescription = await client.chat.completions.create({
    model: "o1-preview",
    messages: initialMessages
  });

  const content = reactComponentDescription.choices[0].message.content
  
  console.log(chalk.blue("🧠 Identifying refactoring steps..."));

  const instructions = await client.chat.completions.create({
    model: "o1-preview",
    messages: [
      ...initialMessages,
      {
        role: "assistant",
        content: content
      },
      {
          role: "user",
          content: `
          Given the React Component Description, How would you use a Postgres database, Drizzle ORM, with this React component using Next.js 14? 
          Include: 
           1. the data model definition: The database schema and Drizzle ORM model, 
           2. modifications on the main react component, and 
           3. backend logic: API route and data-fetching logic.

          Explain your logic. No code or SQL is needed.
          Feel free to add new files and folders as needed.

          ## Project Structure
          The project structure is as follows:

          📦 <project root>
          └ 📂 app
              └ 📂 api
              └ page.tsx
          └ 📂 components
              └ 📂 ui
              └ ${componentName}.tsx
          └ 📂 db
              └ 📜 schema.ts


          ## Output in JSON format.
          {
            "overview": "string",
            "database-model-definition": {
              "overview": "string",
              "database-schema": "string",
              "drizzle-orm-model": "string"
            },
            "modifications-on-main-react-component": {
              "overview": "string",
              "steps": "string"
            },
            "api-route-logic": {
              "overview": "string",
              "file-path": "string", // strictly contains the file path of the API route. reply null if no API route is needed.
              "steps": "string",
            },
            "data-fetching-logic": {
              "overview": "string",
              "file-path": "string", // strictly contains the file path of the data-fetching component. reply null if no data-fetching component is needed.
              "steps": "string"
            },
            "summary": "string"
          }

          Don't include \`\`\`json in your response.
          `
      },
    ],
  });

  const result = instructions.choices[0].message.content ?? '';
  console.log(chalk.green("✔ Refactoring steps identified"));
  return JSON.parse(result);
}
