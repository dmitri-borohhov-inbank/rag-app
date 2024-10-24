import { getEmbeddings } from './getEmbedding';
import { getCompletion } from './getCompletion';
import { encode } from 'gpt-3-encoder';

export interface DocumentChunk {
    id: string;
    content: string;
    embedding: number[];
}

export const answerQuestion = async (
    question: string,
    documentChunks: DocumentChunk[]
): Promise<string> => {
    const questionEmbedding = await getEmbeddings([question]);

    // Calculate similarities between the question and each chunk
    const similarities = documentChunks.map((chunk) => ({
        chunk,
        similarity: cosineSimilarity(questionEmbedding[0], chunk.embedding),
    }));

    // Sort chunks by similarity in descending order
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Initialize variables for accumulating context
    const maxModelTokens = 4096; // e.g., for GPT-3.5-turbo
    const maxResponseTokens = 150; // Adjust based on expected answer length
    const maxContextTokens = maxModelTokens - maxResponseTokens - encode(`Question: ${question}\nAnswer:`).length;

    let accumulatedContext = '';
    let accumulatedTokens = 0;

    // Add chunks until we reach the token limit
    for (const item of similarities) {
        const chunkText = item.chunk.content;
        const chunkTokens = encode(chunkText).length + encode('\n\n').length;

        if (accumulatedTokens + chunkTokens > maxContextTokens) {
            // Can't add more chunks without exceeding the limit
            break;
        }

        accumulatedContext += '\n\n' + chunkText;
        accumulatedTokens += chunkTokens;
    }

    if (!accumulatedContext) {
        throw new Error('No context could be added within the token limit.');
    }
    console.log("Context: ", accumulatedContext)
    // Construct the prompt
    const prompt = `Use the following context to answer the question.\n\nContext:${accumulatedContext}\n\nQuestion: ${question}\nAnswer:`;

    // Use the context to generate an answer
    const answer = await getCompletion(prompt, maxResponseTokens);
    return answer;
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};
