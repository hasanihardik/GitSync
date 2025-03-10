import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiCommitSummary = async (diff: string): Promise<string> => {
    const promptData = {
        instructions: `Review the following GitHub code diff and generate a concise, high-level summary focusing on the key changes:
    
    Prioritize the following aspects:
    1. Any new features or functionality introduced
    2. Significant structural alterations, including refactorings
    3. Modifications to dependencies, such as new additions or removals
    4. Changes to the database schema or related models
    
    Your response should:
    - Be a bulleted list with each item on a separate line
    - Provide clear, actionable insights in each bullet point, using one sentence per item
    - Avoid including minor changes such as formatting adjustments, comment updates, or variable name changes
    - Exclude details that do not impact the functionality or architecture of the code
    
    Ensure that the summary is comprehensive yet brief, capturing only the essential changes that affect the code's behavior, performance, or maintainability.`,
        diff: diff
    };

    const prompt = JSON.stringify(promptData);
    const response = await model.generateContent([prompt]);
    return response.response.text();
};

export async function summariseCode(doc: Document) {
    console.log("Summarising code for ", doc?.metadata?.source);
    const code = doc?.pageContent?.slice(0, 10000);
    try {
        const response = await model.generateContent([
            `You are a super intelligent senior software development engineer at a top tech company.
             You specialize in onboarding junior software engineers onto projects.
             You are onboarding a junior software engineer onto a project and you need to explain the purpose of the ${doc?.metadata?.source} file.
             Here is the code of the ${doc?.metadata?.source} file:
             ---
                ${code}
             ---
    
             Give a summary in not more than 100 words for the code above.
             `
        ]);

        return response.response.text();
    } catch (error) {
        console.error("Error generating summary:", error);
        return "";
    }
}

export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({
        model: "text-embedding-004"
    });
    const result = await model.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values;
};
