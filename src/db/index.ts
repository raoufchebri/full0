import { $ } from "bun";

export async function createPostgresDatabase() {
    try {
      const stdout = await $`npx neonctl projects create -o json --quiet`;
      const projectData = await stdout.json();
      const connectionUri = projectData.connection_uris?.[0]?.connection_uri;
  
      if (connectionUri) {
        console.log(`Successfully created Neon project.`);
        process.env.NEON_DATABASE_URL = connectionUri;
      } else {
        console.error("Failed to extract connection URI from Neon project creation output");
      }
    } catch (error) {
      console.error(`Failed to create Neon project: ${error}`);
    }
  }