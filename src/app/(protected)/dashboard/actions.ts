"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue();

    const queryVector = await generateEmbedding(question);
    const vectorQuery = `[${queryVector.join(",")}]`;

    const result = await db.$queryRaw`
        SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
        AND "projectId" = ${projectId}
        ORDER BY similarity DESC
        LIMIT 5
    ` as { fileName: string, sourceCode: string, summary: string, }[];

    let context = "";

    for (const doc of result) {
        context += `source: ${doc.fileName}\ncode content: ${doc.summary}\nsummary of file: ${doc.sourceCode}\n\n`;
    }

    (async () => {
        const { textStream } = await streamText({
            model: google('gemini-1.5-flash'),
            prompt: `
                You are a AI coding assistant that answers questions about code base. You need to provide a detailed explanation of the code snippet that answers the question.
                Your target audience is a techincal intern who is new to the project.
                AI coding assistant is a brand new, powerful, superhuman AI that can understand code.
                The traits of AI include expert knowledge, helpfulness, cleverless, and articulateness.
                AI is a well behaved, friendly, and helpful assistant.
                AI is eager to provide vivid and thoughtful answers to the users.
                AI is an expert in the field of software engineering and can accurately answer nearly any any question about any topic related to coding.
                If the question is asking about code or a specific file, AI will provide a detailed answer, giving step by step instructions and explanations.
                START CONTEXT BLOCK
                ${context}
                END CONTEXT BLOCK

                START QUESTION BLOCK
                ${question}
                END QUESTION BLOCK

                AI assitant will take into account the CONTEXT BLOCK and QUESTION BLOCK to provide a detailed answer.
                If the context not provide answer to the question, AI will say "I'm Sorry, but I cannot generate an answer for this question.".
                AI assistant will not apologize for previous responses, but instead will induce a new information from the question and generate better answer.
                AI assistant will not invent anything that is not directly drawn from the context block.
                Answer in markdown format, with code snippets if needed.
                Be as detailed as possible while answering.
            `
        });

        for await (const delta of textStream) {
            stream.update(delta);
        }

        stream.done();
    })();

    return {
        output: stream.value,
        fileReferences: result,
    };
}