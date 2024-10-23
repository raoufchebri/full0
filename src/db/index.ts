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

export async function listProjects() {
  try { 
    const stdout = await $`npx neonctl projects list -o json | jq -c '.projects[] | {id, name}'`;
    const projectsString = await stdout.text();
    // Remove trailing newline if present and wrap in square brackets
    const validJsonString = `[${projectsString.trim().replace(/\n/g, ',')}]`;
    const projectsArray = JSON.parse(validJsonString);
    return projectsArray;
  } catch (error) {
    console.error(`Failed to list Neon projects: ${error}`);
    return { projects: [] }; // Return an empty array in case of error
  }
}

export async function getConnectionUri(projectId: string) {
  try {
    const stdout = await $`npx neonctl connection-string --project-id=${projectId} --silent`;
    const connectionString = await stdout.text();
    return connectionString;
  } catch (error) {
    console.error(`Failed to get connection URI for project ${projectId}: ${error}`);
  }
}