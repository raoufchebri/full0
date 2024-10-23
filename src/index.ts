#!/usr/bin/env bun

import { $ } from "bun";
import { config } from "dotenv";
import { OpenAI } from "openai";
import path from "path";
import { generateRefactoredCode, generateDrizzleSchema, generateApiCode, generateParentComponent as generateDataFetchingComponent, generateSeedScript, detectErrors } from "../scripts/prompts";
import { identifyDynamicElements } from "../scripts/prompts/steps";
import { readComponentCode, writeTransformedCode, loadOpenAIKey, askQuestion } from "../scripts/utils";
import { createPostgresDatabase, getConnectionUri, listProjects } from "./db";
import { DRIZZLE_JSON } from "./constants";
import chalk from "chalk";
import inquirer from 'inquirer';

// Load environment variables from .env file
config();
const client = new OpenAI({ apiKey: loadOpenAIKey() });


async function setupDatabase(appDir: string, useExistingDatabase: boolean) {
  if (!useExistingDatabase) {
    console.log(chalk.blue("🔄 Creating database..."));
    await createPostgresDatabase();
    console.log(chalk.green("✔ Database created successfully"));
    await writeTransformedCode(appDir, '.env', `DATABASE_URL=${process.env.NEON_DATABASE_URL}`);
    console.log(chalk.green("✔ Database URL written to .env file."));
  } else {
    console.log(chalk.blue("🔄 Using existing database..."));
    return await listProjects();
  }
}

async function installDependencies(appDir: string) {
  await $`cd ${appDir} && bun install drizzle-kit drizzle-orm @neondatabase/serverless`;
  console.log(chalk.green("✔ Project dependencies installed successfully"));
}

async function main(appDir: string) {
  const { mainComponent, componentPath, componentName, parentComponentName } = await setupComponent(appDir);
  if (!mainComponent) return;

  const useExistingDatabase = await askQuestion("Do you want to use an existing database?");
  await handleDatabaseSetup(appDir, useExistingDatabase);

  const componentCode = await readComponentCode(`${appDir}/${componentPath}`);
  const dynamicElements = await identifyDynamicElements(client, componentCode, parentComponentName, componentName);

  const refactoredCode = await generateRefactoredCode(client, componentCode, dynamicElements["modifications-on-main-react-component"]);

  const drizzleSchema = await setupDrizzle(appDir, refactoredCode, dynamicElements["database-model-definition"], parentComponentName);

  const apiCode = await generateAndWriteApiCode(appDir, refactoredCode, drizzleSchema, dynamicElements["api-route-logic"], parentComponentName, componentName);

  await writeTransformedCode(appDir, componentPath, refactoredCode);

  await handleDataFetching(appDir, refactoredCode, apiCode, dynamicElements["data-fetching-logic"]);

  displayCompletionMessage();
}

// Helper functions

async function setupComponent(appDir: string) {
  const args = process.argv.slice(2);
  const [shadcnCommand, ...restArgs] = args;
  const result = await $`cd ${appDir} && ${shadcnCommand} ${restArgs}`;
  const match = result.text().match(/- components\/([\w-]+\.tsx)/);
  const mainComponent = match?.[1] ?? null;

  if (!mainComponent) {
    console.error("No main component found in the command output.");
    return { mainComponent: null };
  }

  const componentPath = `components/${mainComponent}`;
  const componentName = path.basename(mainComponent, ".tsx");
  const parentComponentName = `${componentName}s`;

  return { mainComponent, componentPath, componentName, parentComponentName };
}

async function handleDatabaseSetup(appDir: string, useExistingDatabase: boolean) {
  const projects = await setupDatabase(appDir, useExistingDatabase);
  
  if (projects) {
    await selectAndSetupExistingProject(appDir, projects);
  }
}

async function selectAndSetupExistingProject(appDir: string, projects: any[]) {
  console.log("Available projects:");

  const choices = projects.map((project, index) => ({
    name: `${project.name} (ID: ${project.id})`,
    value: index
  }));

  const { selectedIndex } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedIndex',
      message: 'Select the project you want to use:',
      choices: choices
    }
  ]);

  const selectedProject = projects[selectedIndex];

  if (selectedProject) {
    console.log(`Selected project: ${selectedProject.name}`);
    const connectionUri = await getConnectionUri(selectedProject.id);
    await writeTransformedCode(appDir, '.env', `DATABASE_URL=${connectionUri}`);
    console.log(chalk.green("✔ Database URL written to .env file."));
  } else {
    console.error("Invalid project selection.");
    throw new Error("Invalid project selection");
  }
}

async function setupDrizzle(appDir: string, refactoredCode: string, databaseModelDefinition: any, parentComponentName: string) {
  const { overview: schemaOverview, "database-schema": databaseSchema, "drizzle-orm-model": drizzleOrmModel } = databaseModelDefinition;
  const drizzleSchema = await generateDrizzleSchema(client, refactoredCode, { overview: schemaOverview, databaseSchema, drizzleOrmModel }, parentComponentName);
  
  await writeTransformedCode(appDir, 'drizzle.config.ts', DRIZZLE_JSON);
  await writeTransformedCode(appDir, 'db/schema.ts', drizzleSchema);
  await installDependencies(appDir);
  return drizzleSchema;
}

async function generateAndWriteApiCode(appDir: string, refactoredCode: string, drizzleSchema: string, apiRouteLogic: any, parentComponentName: string, componentName: string) {
  const { overview: apiOverview, "file-path": apiRouteFilePath, steps: apiRouteSteps } = apiRouteLogic;
  const apiCode = await generateApiCode(client, refactoredCode, drizzleSchema, { overview: apiOverview, filePath: apiRouteFilePath, steps: apiRouteSteps }, parentComponentName, componentName);
  
  await writeTransformedCode(appDir, apiRouteFilePath, apiCode);
  return apiCode;
}

async function handleDataFetching(appDir: string, refactoredCode: string, apiCode: string, dataFetchingLogic: any) {
  const { "file-path": dataFetchingFilePath } = dataFetchingLogic;
  if (dataFetchingFilePath) {
    const dataFetchingComponent = await generateDataFetchingComponent(client, refactoredCode, apiCode, dataFetchingLogic);
    await writeTransformedCode(appDir, dataFetchingFilePath, dataFetchingComponent);
  }
}

function displayCompletionMessage() {
  console.log(chalk.green("\n ✔ Fullstack app setup complete!"));
  console.log(chalk.gray("\nYou can now run the following commands:"));
  console.log(chalk.gray("1. Generate and migrate your database schema:"));
  console.log(chalk.blue("   npx drizzle-kit generate && npx drizzle-kit migrate"));
  console.log(chalk.gray("\n2. Start your application:"));
  console.log(chalk.blue("   bun run dev"));
  console.log(chalk.gray("   or"));
  console.log(chalk.blue("   npm run dev"));
  console.log(chalk.gray("\nEnjoy building with your new dynamic component!"));
}

// Main execution
main(process.cwd()).catch(console.error);