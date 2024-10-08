import { OpenAI } from "openai";
import { TEMPERATURE, DATA_FETCHING_NEXT_14 } from "../../../src/constants";

export async function generateParentComponent(client: OpenAI, refactoredCode: string, apiCode: string, refactoringSteps: string, parentComponentName: string, componentName: string): Promise<string> {
    console.log("Step 5: Generating parent component...");
    const parentComponent = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
          {
              role: "system",
              content: `
           You are an Code Assistant. Your function to refactor the React Component code based on the user's instructions.
           Only make the changes requested by the user.
           Use Typescript syntax.
           Use Next.js 14 syntax. 
  
           Add this line at the top of the file when using useState, useEffect, etc.
           
           "use client"
  
           Next.js 14 examples:
           ${DATA_FETCHING_NEXT_14}
           `
          },
          {
              role: "user",
              content: `React Component: ${refactoredCode}`
          },
          {
              role: "assistant",
              content: `Additional Instructions: ${refactoringSteps}`
          },
          {
              role: "user",
              content: `Next.js 14 API: ${apiCode}`
          },
          {
              role: "user",
              content: `
           Based on the React Component and the API, generate a parent component located in app/${parentComponentName}/page.tsx that will use the refactored component. 
           The child component is located in @/components/${componentName}.tsx. Don't include \`\`\`tsx or \`\`\`javascript in your code response.`
          },
      ],
      temperature: TEMPERATURE
    });
    const component = parentComponent.choices[0].message.content ?? '';
    console.log(`Parent component generated.`);
    return component;
  }