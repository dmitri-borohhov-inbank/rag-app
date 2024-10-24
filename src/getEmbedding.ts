import axios from 'axios';
import {encode} from "gpt-3-encoder";
import dotenv from 'dotenv';

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_KEY;


export const getEmbeddings = async (texts: string[]): Promise<number[][]> => {
    const embeddings: number[][] = [];
    for (let text in texts) {
        const encodedText = encode(text)
        // Text is within token limit, proceed as usual
        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                input: text,
                model: 'text-embedding-ada-002',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );
        embeddings.push(response.data.data[0].embedding)

    }
    return embeddings;
};

// Helper function to split text into chunks within token limit
function splitTextIntoChunks(text: string, maxTokens: number): string[] {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        const sentenceTokens = encode(sentence).length;
        const currentChunkTokens = encode(currentChunk).length;

        if (currentChunkTokens + sentenceTokens > maxTokens) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                // Sentence itself exceeds maxTokens, add it as a separate chunk
                chunks.push(sentence.trim());
                currentChunk = '';
            }
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }
    console.log('chunks: ', chunks.length)
    return chunks;
}

// Helper function to average embeddings
function averageEmbeddings(embeddings: number[][]): number[] {
    const numEmbeddings = embeddings.length;
    const embeddingLength = embeddings[0].length;
    const averagedEmbedding = new Array(embeddingLength).fill(0);

    for (const embedding of embeddings) {
        for (let i = 0; i < embeddingLength; i++) {
            averagedEmbedding[i] += embedding[i];
        }
    }

    for (let i = 0; i < embeddingLength; i++) {
        averagedEmbedding[i] /= numEmbeddings;
    }

    return averagedEmbedding;
}