export const MODEL = "gpt-4o-2024-08-06";
export const TEMPERATURE = 0.5;
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
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  chat_id: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  return NextResponse.json({ message: "Hello World" }, {
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
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
    });
    `