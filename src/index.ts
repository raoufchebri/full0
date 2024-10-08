#!/usr/bin/env bun

import { $ } from "bun";
import { config } from "dotenv";
import { OpenAI } from "openai";
import path from "path";
import { generateRefactoredCode, generateDrizzleSchema, generateApiCode, generateParentComponent, generateSeedScript, correctCode } from "../scripts/prompts";
import { identifyDynamicElements } from "../scripts/prompts/steps";
import { readComponentCode, writeTransformedCode, loadOpenAIKey, askQuestion } from "../scripts/utils";
import { createPostgresDatabase } from "./db";
import { DRIZZLE_JSON } from "./constants";

// Load environment variables from .env file
config();
const client = new OpenAI({ apiKey: loadOpenAIKey() });


async function setupDatabase(appDir: string) {
  console.log("Creating database...");
  await createPostgresDatabase();
  console.log("Database created successfully.");
  await writeTransformedCode(appDir, '.env', `DATABASE_URL=${process.env.NEON_DATABASE_URL}`);
  console.log("Database URL written to .env file.");
}

async function installDependencies(appDir: string) {
  console.log("Installing project dependencies..."); 
  await $`cd ${appDir} && bun install drizzle-kit drizzle-orm @neondatabase/serverless`;
  console.log("All dependencies installed successfully.");
}

async function main(appDir: string) {

  // Get command line arguments, excluding the first two (node and script path)
  const args = process.argv.slice(2);    
  const [shadcnCommand, ...restArgs] = args;
  const result = await $`cd ${appDir} && ${shadcnCommand} ${restArgs}`;
  const match = result.text().match(/- components\/([\w-]+\.tsx)/);
  const mainComponent = match?.[1] ?? null;

  if(!mainComponent) {
      console.error("No main component found in the command output.");
      return;
  }
  
  const createProps = await askQuestion("Do you want to create props?");
  
  if (createProps) {
    const createDatabase = await askQuestion("Do you want to create a database?");
    const createSchema = createDatabase && await askQuestion("Do you want to create a database schema using Drizzle ORM?");
    const createFunction = createSchema && await askQuestion("Do you want to fetch data from the database?");
    const createSeed = createFunction && await askQuestion("Do you want to create a seed script?");
    
    let _drizzleSchema, _apiCode, seedScript

    if (createDatabase) {
      setupDatabase(appDir);
    }

    const componentPath = `components/${mainComponent}`;
    const componentName = path.basename(mainComponent, ".tsx");
    const parentComponentName = `${componentName}s`;
    
    let _componentCode = await readComponentCode(`${appDir}/${componentPath}`);
    const refactoringSteps = await identifyDynamicElements(client, _componentCode, parentComponentName, componentName);
    
    const refactoredCode = await generateRefactoredCode(client, _componentCode, refactoringSteps);
    
    if (createSchema) {
      _drizzleSchema = await generateDrizzleSchema(client, refactoredCode, refactoringSteps, parentComponentName);
      await writeTransformedCode(appDir, 'drizzle.config.ts', DRIZZLE_JSON);
      installDependencies(appDir);
      
      if (createFunction) {
        _apiCode = await generateApiCode(client, refactoredCode, _drizzleSchema, refactoringSteps, parentComponentName, componentName);
        
        if (createSeed) {          
          seedScript = await generateSeedScript(client, _componentCode, _drizzleSchema, _apiCode);
        }
      }
    }
    
    
    const correctedCode = await correctCode(client, refactoredCode, {
      drizzleSchema: _drizzleSchema,
      apiCode: _apiCode,
      parentComponentName,
      componentName
    });
    
    const {reactComponent, drizzleSchema, api, parentComponent} = JSON.parse(correctedCode);
    _componentCode = reactComponent;
    _drizzleSchema = drizzleSchema;
    _apiCode = api;
    
    await writeTransformedCode(appDir, componentPath, _componentCode);
    createSchema && await writeTransformedCode(appDir, 'db/schema.ts', _drizzleSchema);
    createFunction && await writeTransformedCode(appDir, `app/api/${parentComponentName}/route.ts`, _apiCode);
    createSeed && seedScript && await writeTransformedCode(appDir, 'db/seed.ts', seedScript);
    
    let _parentComponent = await generateParentComponent(client, _componentCode, _apiCode, refactoringSteps, parentComponentName, componentName);
    await writeTransformedCode(appDir, `app/${parentComponentName}/page.tsx`, _parentComponent);


  } else {
    console.log("Skipping prop creation as per user request.");
  }
}

// Replace the hardcoded path with the current working directory
main(process.cwd()).catch(console.error);