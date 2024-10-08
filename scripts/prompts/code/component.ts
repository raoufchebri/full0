import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14, TEMPERATURE, MODEL } from "../../../src/constants";
import chalk from "chalk";

export async function generateRefactoredCode(client: OpenAI, componentCode: string, refactoringSteps: string): Promise<string> {
    console.log(chalk.blue("Step 2: Generating refactored code..."));
    
    const steps = [
        "Converting static text to props",
    ];

    const refactoredComponent = await client.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: `
             You are an Code Assistant. Your function to refactor the React Component code based on the user's instructions.
             Only make the changes requested by the user.
             Use Typescript syntax and Next.js 14. 
    
             Add this line at the top of the file when using useState, useEffect, etc.
             
             "use client"
    
             See more Next.js 14 examples:
             ${DATA_FETCHING_NEXT_14}
                `
            },
            {
                role: "user",
                content: `React Component: ${componentCode}`
            },
            {
                role: "assistant",
                content: `Additional Instructions: ${refactoringSteps}`
            },
            {
                role: "user",
                content: `Refactor the React Component and turn the static text into props so the component can be reused. Don't include \`\`\`tsx or \`\`\`javascript in your code response.`
            },
        ],
        temperature: TEMPERATURE,
    });

    steps.forEach(async (step, index) => {
        console.log(chalk.green(`✔ ${step}`));
        // Simulate progress with a small delay
        Bun.sleep(500);
    });

    const refactoredCode = refactoredComponent.choices[0].message.content ?? '';
    console.log(chalk.green("✔ Refactored code generated"));
    return refactoredCode;
}