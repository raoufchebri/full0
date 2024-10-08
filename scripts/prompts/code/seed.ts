import { OpenAI } from "openai";
import { MODEL, TEMPERATURE } from "../../../src/constants";

export async function generateSeedScript(client: OpenAI, componentCode: string, drizzleSchema: string, apiCode: string) {
    console.log("Step 6: Generating seed script...");
    const seedScriptPrompt = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
          You are a Code Assistant. Your function is to generate a seed script to populate the database based on the Schema.
          Only make the changes requested by the user.
          Use TypeScript syntax.
          `
        },
        {
          role: "user",
          content: `
          Path to the Drizzle Schema: db/schema.ts
          
          Drizzle Schema: 
          ${drizzleSchema}
          `
        },
        {
          role: "user",
          content: `
          Generate a seed script to populate the database with the data. 

          // Example of a seed script:
          \`\`\`ts
          import { drizzle } from 'drizzle-orm/neon-http'
          import { userTable } from './schema'
          import { neon } from '@neondatabase/serverless'

            
          const sql = neon(process.env.DATABASE_URL!);
          const db = drizzle(sql);

          const seedUsers = (db: any) => {
            const userData = [
              {
                email: 'a@a.com',
                emailVerified: 1,
              },
              {
                email: 'b@b.com',
                emailVerified: 1,
              },
              {
                email: 'c@c.com',
                emailVerified: 1,
              },
            ]

            try {
              db.insert(userTable).values(userData)

              const users = db.select().from(userTable)

              console.log({ users })
            } catch (err) {
              console.error('Something went wrong...')
              console.error(err)
            }
          }

          const main = () => {
            console.log('🧨 Started seeding the database...\n')
            seedUsers(db)
            console.log('\n🧨 Done seeding the database successfully...\n')
          }

          main()
          \`\`\`

          Don't include \`\`\`tsx, \`\`\`javascript, \`\`\`ts, \`\`\`typescript, \`\`\`json or \`\`\`javascript in your code response.
          `
        },
      ],
      temperature: TEMPERATURE
    });
    const seedScript = seedScriptPrompt.choices[0].message.content ?? '';
    console.log(`Seed script generated. ${seedScript}`);
    return seedScript;
  }