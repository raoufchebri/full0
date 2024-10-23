export const MODEL = "gpt-4o-2024-08-06";

export const TEMPERATURE = 0.2;

export const DATA_FETCHING_NEXT_14 = `
## Fetching data on the server with the fetch API

This component will fetch and display a list of blog posts. The response from fetch will be automatically cached.

\`\`\`tsx
// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.vercel.app/blog');
  const posts = await data.json();
  return (
    <ul>
      {posts.map((post: { id: string; title: string }) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`
## Fetching data on the client
We recommend first attempting to fetch data on the server-side.

However, there are still cases where client-side data fetching makes sense. In these scenarios, you can manually call fetch in a useEffect (not recommended), or lean on popular React libraries in the community (such as SWR or React Query) for client fetching.

\`\`\`tsx
// app/page.tsx
'use client'
 
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
}

export function Posts() {
  const [posts, setPosts] = useState<Post[] | null>(null);
 
  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch('https://api.vercel.app/blog');
      const data: Post[] = await res.json();
      setPosts(data);
    }
    fetchPosts();
  }, []);
 
  if (!posts) return <div>Loading...</div>;
 
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Route Handlers
Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs.
### Convention
Route Handlers are defined in a route.ts file inside the app directory:

\`\`\`tsx
// app/api/shopping-card/route.ts

interface Params {
  chat_id: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  return Response.json({ message: "Hello World" }, {
    headers: { 'Content-Type': 'application/json' }
  });
}
\`\`\`
`;

export const DRIZZLE_JSON = `
    import { defineConfig } from 'drizzle-kit';
    export default defineConfig({
    schema: "./db/schema.ts",
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || '',
    },
    verbose: true,
    strict: true,
    });
    `

export const DRIZZLE_SCHEMA_EXAMPLES = `
          ## Table Schema
          import { serial, text, pgTable, pgSchema } from "drizzle-orm/pg-core";
          export const mySchema = pgSchema("my_schema");
          export const colors = mySchema.enum('colors', ['red', 'green', 'blue']);
          export const mySchemaUsers = mySchema.table('users', {
            id: serial('id').primaryKey(),
            name: text('name'),
            color: colors('color').default('red'),
          });

          ## Enum
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

          ## Not Null
          const table = pgTable('table', {
          integer: integer('integer').notNull(),
          });

          ## Primary Key
          const table = pgTable('table', {
          id: serial('id').primaryKey(),
          });

          ## Composite Key
          import { serial, text, integer, primaryKey, pgTable } from "drizzle-orm/pg-core";
          export const user = pgTable("user", {
            id: serial("id").primaryKey(),
            name: text("name"),
          });
          export const book = pgTable("book", {
            id: serial("id").primaryKey(),
            name: text("name"),
          });
          export const booksToAuthors = pgTable("books_to_authors", {
            authorId: integer("author_id"),
            bookId: integer("book_id"),
          }, (table) => {
            return {
              pk: primaryKey({ columns: [table.bookId, table.authorId] }),
              pkWithCustomName: primaryKey({ name: 'custom_name', columns: [table.bookId, table.authorId] }),
            };
          });

          ## Foreign Key
          import { serial, text, integer, pgTable } from "drizzle-orm/pg-core";
          export const user = pgTable("user", {
            id: serial("id"),
            name: text("name"),
          });
          export const book = pgTable("book", {
            id: serial("id"),
            name: text("name"),
            authorId: integer("author_id").references(() => user.id)
          });
          `
export const DRIZZLE_DATA_TYPES = `
        integer (int, int4)
        smallint (int2)
        bigint (int8)
        serial
        smallserial
        bigserial
        boolean
        text
        varchar
        char
        numeric (decimal)
        real (float4)
        double precision (float8)
        json
        jsonb
        time
        timestamp
        date
        interval
        point
        line
        enum
        `

  export const DRIZZLE_QUERY_EXAMPLES = `

          ## SELECT with all columns
          const result = await db.select().from(users);
          /*
            {
              id: number;
              name: string;
              age: number | null;
            }[]
          */

            ## Conditional Select
            db
            .select({
              id: users.id,
              ...(withName ? { name: users.name } : {}),
            })
            .from(users);

            ## Filtering
            await db.select().from(users).where(eq(users.id, 42));
            await db.select().from(users).where(lt(users.id, 42));
            await db.select().from(users).where(gte(users.id, 42));
            await db.select().from(users).where(ne(users.id, 42));

            ## Combining filters

            import { eq, and, sql } from 'drizzle-orm';
            await db.select().from(users).where(
              and(
                eq(users.id, 42),
                eq(users.name, 'Dan')
              )
            );

            ## Distinct
            await db.selectDistinct().from(users).orderBy(usersTable.id, usersTable.name);
            await db.selectDistinct({ id: users.id }).from(users).orderBy(usersTable.id);

            ## Limit & Offset
            await db.select().from(users).limit(10).offset(10);

            ## Order By
            await db.select().from(users).orderBy(users.name);
            await db.select().from(users).orderBy(desc(users.name));

            ## With clause
            const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
            const result = await db.with(sq).select().from(sq);

            ## Select from subquery
            const sq = db.select().from(users).where(eq(users.id, 42)).as('sq');
            const result = await db.select().from(sq);

            ## JOIN
          await db
            .select()
            .from(posts)
            .leftJoin(comments, eq(posts.id, comments.post_id))
            .where(eq(posts.id, 10))

            // INSERT
            await db.insert(users).values({ email: 'user@gmail.com' })

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