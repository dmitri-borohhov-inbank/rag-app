import { Tiktoken, encoding_for_model } from '@dqbd/tiktoken';

let encoding: Tiktoken;

export const getEncoding = () => {
    if (!encoding) {
        encoding = encoding_for_model('text-embedding-ada-002');
    }
    return encoding;
};

export const splitTextIntoChunks = (
    text: string,
    maxTokens: number = 3000
): string[] => {
    const encoding = getEncoding();
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let chunkTokens: number[] = [];
    let chunkText: string[] = [];

    for (const sentence of sentences) {
        const sentenceTokens = encoding.encode(sentence);
        if (chunkTokens.length + sentenceTokens.length > maxTokens) {
            chunks.push(chunkText.join(' '));
            chunkTokens = [];
            chunkText = [];
        }
        // @ts-ignore
        chunkTokens = chunkTokens.concat(sentenceTokens);
        chunkText.push(sentence);
    }

    if (chunkText.length > 0) {
        chunks.push(chunkText.join(' '));
    }

    // Clean up encoding to prevent memory leaks
    encoding.free();

    return chunks;
};

import {decode, encode} from 'gpt-3-encoder';

export const splitText = (text: string, maxTokens: number, overlapTokens: number): string[] => {
    const tokens = encode(text);
    const chunks: string[] = [];
    let start = 0;
    const stride = maxTokens - overlapTokens;

    while (start < tokens.length) {
        const chunkTokens = tokens.slice(start, start + maxTokens);
        const chunk = decode(chunkTokens);
        chunks.push(chunk);
        start += stride;
    }

    return chunks;
};