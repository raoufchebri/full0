import { OpenAI } from "openai";
import { DRIZZLE_QUERY_EXAMPLES, TEMPERATURE } from "../../../src/constants";
import chalk from "chalk";

export async function generateApiCode(client: OpenAI, refactoredCode: string, drizzleSchema: string, refactoringSteps: {overview: string, filePath: string, steps: string}, parentComponentName: string, componentName: string): Promise<string> {
    console.log(chalk.blue("🔄 Generating API Route..."));
    console.log(chalk.gray(refactoringSteps.overview));
    const apiStep = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
          {
              role: "system",
              content: `
           You are a Code Assistant. Your function is to create the Next.js 14 API route based on the user's instructions, the React Component and Drizzle Schema provided.
           Use TypeScript syntax.
          
           `
          },
          {
              role: "user",
              content: `
              Task Overview: ${refactoringSteps.overview}

              File Path: ${refactoringSteps.filePath}
              `
          },
          {
              role: "user",
              content: `API Route instructions: ${refactoringSteps.steps}`
          },
          {
              role: "user",
              content: `React Component: ${refactoredCode}`
          },
          {
              role: "user",
              content: `Drizzle ORM Schema: ${drizzleSchema}`
          },
          {
              role: "user",
              content: `
           Generate a Next.js 14 API route located in app/api/${parentComponentName}/route.tsx. 
  
          The schema is in the db/schema.ts file.
          📦 <project root>
          └ 📂 app
              └ 📂 api
                  └ 📂 ${parentComponentName}
                      └ 📜 route.ts
          └ 📂 db
              └ 📜 schema.ts
  
           // API Route Examples:
           
           import { neon } from '@neondatabase/serverless'
           import { drizzle } from 'drizzle-orm/neon-http'
           import { users } from '@/db/schema'
           const sql = neon(process.env.DATABASE_URL!)
           const db = drizzle(sql);
  
           export async function GET(req: Request) {
              const data = await db.select().from(users)
              return Response.json(data)
          }
           export async function POST(req: Request) {
              const { name, email } = await req.json()
              const data = await db.insert(users).values({ name, email })
              return Response.json(data)
          }

          // Drizzle Query Examples

          ${DRIZZLE_QUERY_EXAMPLES}
           `
          },
          {
            role: "user",
            content: `
            Make sure the API route works well with the React Component and Drizzle ORM Schema.
            Don't include \`\`\`tsx or \`\`\`javascript in your code response.
            `
          }
      ],
      temperature: TEMPERATURE
    });
    const apiCode = apiStep.choices[0].message.content ?? '';
    console.log(chalk.green("✔ API code generated"));
    return apiCode;
  }