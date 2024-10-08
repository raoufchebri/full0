import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14, MODEL, TEMPERATURE } from "../../../src/constants";

export async function generateDrizzleSchema(client: OpenAI, refactoredCode: string, refactoringSteps: string, parentComponentName: string): Promise<string> {
    console.log("Step 3: Generating Drizzle Schema...");
    const drizzleSchema = await client.chat.completions.create({
      model: MODEL,
      messages: [
          {
              role: "system",
              content: `
           You are an Code Assistant. Your function to generate the Drizzle Schema based on the API and React Component provided.
           Only make the changes requested by the user.
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
          },
          {
              role: "user",
              content: `Additional Context: ${refactoringSteps}`
          },
          {
              role: "user",
              content: `
           Based on the React Component and the API, generate a Drizzle Schema. Declare your SQL schema directly in TypeScript in schema.ts file.
           Don't include \`\`\`tsx or \`\`\`javascript in your code response.
  
          📦 <project root>
          └ 📂 app
              └ 📂 api
                  └ 📂 ${parentComponentName}
                      └ 📜 route.ts
          └ 📂 db
              └ 📜 schema.ts
          
          Example:
           \`\`\`typescript
          import { integer, pgEnum, pgTable, serial, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
  
          // declaring enum in database
          export const popularityEnum = pgEnum('popularity', ['unknown', 'known', 'popular']);
  
          export const countries = pgTable('countries', {
          id: serial('id').primaryKey(),
          name: varchar('name', { length: 256 }),
          }, (countries) => {
          return {
              nameIndex: uniqueIndex('name_idx').on(countries.name),
          }
          });
  
          export const cities = pgTable('cities', {
          id: serial('id').primaryKey(),
          name: varchar('name', { length: 256 }),
          countryId: integer('country_id').references(() => countries.id),
          popularity: popularityEnum('popularity'),
          });
          \`\`\`
           
           `
          },
      ],
      temperature: TEMPERATURE
    });
    const schema = drizzleSchema.choices[0].message.content ?? '';
    console.log(`Drizzle Schema generated`);
    return schema;
  }