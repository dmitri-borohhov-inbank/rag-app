import {encode} from "gpt-3-encoder";
import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_KEY;
export const getCompletion = async (
    prompt: string,
    maxResponseTokens: number
): Promise<string> => {
    const maxModelTokens = 4096; // For GPT-3.5-turbo
    const promptTokens = encode(prompt).length;

    if (promptTokens + maxResponseTokens > maxModelTokens) {
        throw new Error('Prompt length exceeds model context length.');
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant. Find answers to questions based on the content provided. Do not use any other knowledge base. If the info is not found in the provided prompt, just say so without inventing anything.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: maxResponseTokens,
                temperature: 0,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error('Error getting completion:', error.response?.data || error.message);
        throw new Error('Failed to generate an answer.');
    }
};