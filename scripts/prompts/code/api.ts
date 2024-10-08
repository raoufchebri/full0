import { OpenAI } from "openai";
import { TEMPERATURE } from "../../../src/constants";

export async function generateApiCode(client: OpenAI, refactoredCode: string, drizzleSchema: string, refactoringSteps: string, parentComponentName: string, componentName: string): Promise<string> {
    console.log("Step 4: Generating API...");
    const apiStep = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
          {
              role: "system",
              content: `
           You are a Code Assistant. Your function is to create the Next.js 14 serverless function for the React Component code based on the component definion and the Drizzle Schema.
           Only make the changes requested by the user.
           Use TypeScript syntax.
          
           `
          },
          {
              role: "user",
              content: `React Component: ${refactoredCode}`
          },
          {
              role: "user",
              content: `Drizzle Schema: ${drizzleSchema}`
          },
          {
              role: "user",
              content: `
           Generate Next.js 14 GET All function located in app/api/${parentComponentName}/route.tsx that will be called by the refactored component's parent component. 
           The child component is located in @/components/${componentName}.tsx. Don't include \`\`\`tsx or \`\`\`javascript in your code response.
  
          The schema is in the db/schema.ts file.
          📦 <project root>
          └ 📂 app
              └ 📂 api
                  └ 📂 ${parentComponentName}
                      └ 📜 route.ts
          └ 📂 db
              └ 📜 schema.ts
  
           // Example:
           
           import { neon } from '@neondatabase/serverless'
           import { drizzle } from 'drizzle-orm/neon-http'
  
           const sql = neon(process.env.DATABASE_URL!)
           const db = drizzle(sql);
  
           export async function GET(req: Request) {
              const data = await db.select().from(table)
              return Response.json(data)
          }
           `
          },
      ],
      temperature: TEMPERATURE
    });
    const apiCode = apiStep.choices[0].message.content ?? '';
    console.log(`API code generated.`);
    return apiCode;
  }

  const prompt = `

  // Example with Drizzle ORM
  // Access your data
    await db
    .select()
    .from(posts)
    .leftJoin(comments, eq(posts.id, comments.post_id))
    .where(eq(posts.id, 10))

    // SELECT * 
    // FROM posts
    // LEFT JOIN comments ON posts.id = comments.post_id
    // WHERE posts.id = 10

    await db.insert(users).values({ email: 'user@gmail.com' })

    // INSERT INTO users (email) VALUES ('user@gmail.com')

    // Advanced
    // With Drizzle, queries can be composed and partitioned in any way you want. You can compose filters independently from the main query, separate subqueries or conditional statements, and much more. Let’s check a few advanced examples:

    // Compose a WHERE statement and then use it in a query
    async function getProductsBy({
    name,
    category,
    maxPrice,
    }: {
    name?: string;
    category?: string;
    maxPrice?: string;
    }) {
    const filters: SQL[] = [];
    if (name) filters.push(ilike(products.name, name));
    if (category) filters.push(eq(products.category, category));
    if (maxPrice) filters.push(lte(products.price, maxPrice));
    return db
        .select()
        .from(products)
        .where(and(...filters));
    }
`