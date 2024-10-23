import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';
import os from 'os';
import chalk from "chalk";
import readline from 'readline';

export async function readComponentCode(componentPath: string): Promise<string> {
    const componentCode = await readFile(`${componentPath}`, "utf-8");
    console.log(chalk.green(`✔ Component ${componentPath} read successfully`));
    return componentCode;
}

export async function writeTransformedCode(appDir: string, filePath: string, content: string) {
    const fullPath = path.join(appDir, filePath);
    // Ensure the directory exists
    await mkdir(path.dirname(fullPath), { recursive: true });
    // Write the file
    await writeFile(fullPath, content);
}

// Load OpenAI API key from config file
export function loadOpenAIKey(): string {
    const configPath = path.join(os.homedir(), '.config', 'full0', 'config.json');
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      if (!config.openaiApiKey) {
        throw new Error('OpenAI API key not found in config file');
      }
      return config.openaiApiKey;
    } catch (error) {
      console.error('Error reading OpenAI API key from config:', error);
      process.exit(1);
    }
  }


export const askQuestion = (question: string): Promise<boolean> => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`? ${question} › ${chalk.gray('(y/N)')} `, (answer) => {
        rl.close();
        process.stdout.write('\r\x1b[K'); // Clear the line
        const normalizedAnswer = answer.trim().toLowerCase();
        resolve(normalizedAnswer === 'y');
      });
    });
  };