import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14, TEMPERATURE, MODEL } from "../../../src/constants";
import chalk from "chalk";
import type { ChatCompletionMessageParam } from "openai/src/resources/chat/index.js";

export async function generateRefactoredCode(client: OpenAI, componentCode: string, refactoringSteps: {overview: string, steps: string}): Promise<string> {
    console.log(chalk.blue("🔄 Refactoring component..."));
    console.log(chalk.gray(refactoringSteps.overview));


    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `
            You are an Code Assistant. Your function to refactor the React Component code based on the user's instructions.
            Execute the refactoring instructions and return the refactored code.
            Use Typescript syntax and Next.js 14. 
            Add this line at the top of the file when using useState, useEffect, etc.
            
            "use client"
            `
        },
        {
            role: "user",
            content: `Objective: ${refactoringSteps.overview}`
        },
        {
            role: "user",
            content: `Refactoring Instructions: ${refactoringSteps.steps}`
        },
        {
            role: "user",
            content: `React Component: ${componentCode}`
        },
        {
            role: "user",
            content: `Don't include \`\`\`tsx or \`\`\`javascript in your code response.`
        },
    ]

    const refactoredComponent = await client.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: TEMPERATURE,
    });

    const refactoredCode = refactoredComponent.choices[0].message.content ?? '';
    console.log(chalk.green("✔ Refactored code generated"));
    return refactoredCode;
}