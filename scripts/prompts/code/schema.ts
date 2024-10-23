import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14, DRIZZLE_DATA_TYPES, DRIZZLE_SCHEMA_EXAMPLES, MODEL, TEMPERATURE } from "../../../src/constants";
import chalk from "chalk";

export async function generateDrizzleSchema(client: OpenAI, refactoredCode: string, databaseModelDefinition: {overview: string, databaseSchema: string, drizzleOrmModel: string}, parentComponentName: string): Promise<string> {
    console.log(chalk.blue("🔄 Generating Drizzle Schema..."));
    console.log(chalk.gray(databaseModelDefinition.overview));

    const drizzleSchema = await client.chat.completions.create({
      model: MODEL,
      messages: [
          {
              role: "system",
              content: `
           You are an Code Assistant. Your function to generate the Drizzle Schema based on Database Schema and Drizzle ORM Model provided.
           Only make the changes requested by the user.
           Use Typescript syntax.
           Use Drizzle ORM syntax. 
           `
          },
          {
              role: "user",
              content: `Task Summary: ${databaseModelDefinition.overview}`
          },
          {
              role: "user",
              content: `
              Database Schema: 
              ______________________________________________________________________________________
              ${databaseModelDefinition.databaseSchema}
              ______________________________________________________________________________________
              
              Drizzle ORM Model:
              ______________________________________________________________________________________
              ${databaseModelDefinition.drizzleOrmModel}
              ______________________________________________________________________________________
              `
          },
          {
              role: "user",
              content: `React Component: ${refactoredCode}`
          },
          {
              role: "user",
              content: `
           Based on the instructions provided, declare the Drizzle ORM schema directly in TypeScript in schema.ts file.
  
          📦 <project root>
          └ 📂 app
              └ 📂 api
                  └ 📂 ${parentComponentName}
                      └ 📜 route.ts
          └ 📂 db
              └ 📜 schema.ts
          
          Drizzle Schema Example:
          ______________________________________________________________________________________
          ${DRIZZLE_SCHEMA_EXAMPLES}
          ______________________________________________________________________________________

          Drizzle ORM Data Types:
          ______________________________________________________________________________________
          ${DRIZZLE_DATA_TYPES}
              
           `
          },
          {
            role: "user",
            content: `Don't include \`\`\`typescript or \`\`\`javascript in your code response.`
          }
      ],
      temperature: TEMPERATURE
    });
    const schema = drizzleSchema.choices[0].message.content ?? '';
    console.log(chalk.green("✔ Drizzle Schema generated"));
    return schema;
  }