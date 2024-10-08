import { OpenAI } from "openai";
import { DATA_FETCHING_NEXT_14 } from "../../../src/constants";
import chalk from "chalk";

export async function identifyDynamicElements(client: OpenAI, componentCode: string, parentComponentName: string, componentName: string): Promise<string> {
  console.log(chalk.blue("Step 1: Identifying dynamic elements..."));
  
  const steps = [
    "Analyzing component structure",
    "Identifying static text",
    "Determining prop candidates",
    "Planning API structure",
    "Finalizing refactoring strategy"
  ];

  const refactoringInstructions = await client.chat.completions.create({
    model: "o1-preview",
    messages: [
        {
            role: "user",
            content: `
            You are a Code Assistant. Your function is to refactor the React Component code based on the user's instructions.
            Your task is to turn the static text in the React Component provided into props so the component can be reused and receive data from the database.

            For that you will: 
            1. Create three files:
            - app/api/${parentComponentName}/route.tsx
            - app/${parentComponentName}/page.tsx
            - @/components/${componentName}.tsx
            2. Generate the refactored component and extract the props.
            3. Generate the file to fetch data.
            4. Generate the parent component that makes the API call and passes the data to the refactored component.

            Explain how you make the changes requested.

            A few rules:
            - Use Typescript syntax.
            - Use Next.js 14 syntax. A few Next.js examples are provided.
            - Make sure to accomplish your task by making as few changes to the React Component as possible without changing the logic.
            - Only extract text that makes sense to store in a prop and a database. Do not extract button text, link text, or other non-data text.
            - Do not refactor style or layout code.
            - Ensure that the refactored component is reusable and can handle varying data inputs.
            - Ensure that the code is correct and works.

            Next.js 14 examples:
            ${DATA_FETCHING_NEXT_14}
`
        },
        {
            role: "user",
            content: `Refactor the React Component and turn the static text into props so the component can be reused. React Component: ${componentCode}`
        },
        {
            role: "user",
            content: `Generate the parent component located in app/${parentComponentName}/page.tsx that will use the refactored component. The child component is located in @/components/${componentName}.tsx.`
        },
        {
            role: "user",
            content: `Generate the API located in app/api/${parentComponentName}/route.tsx that will be called by the refactored component's parent component. The child component is located in @/components/${componentName}.tsx.`
        },
    ],
  });

  steps.forEach((step, index) => {
    console.log(chalk.green(`✔ ${step}`));
    // Simulate progress with a small delay
    Bun.sleep(500);
  });

  const result = refactoringInstructions.choices[0].message.content ?? '';
  console.log(chalk.green("✔ Refactoring steps identified"));
  return result;
}
