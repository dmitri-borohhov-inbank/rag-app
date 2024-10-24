import fs from 'fs';
import pdfParse from 'pdf-parse';
import util from 'util';
import { splitText } from './utils';
import {getPageContent} from "./confluence";

const readFile = util.promisify(fs.readFile);

export const processFile = async (file: Express.Multer.File): Promise<string[]> => {
    const filePath = file.path;
    let content = '';

    if (file.mimetype === 'application/pdf') {
        const dataBuffer = await readFile(filePath);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
    } else if (file.mimetype === 'text/plain') {
        content = await readFile(filePath, 'utf-8');
    } else {
        throw new Error('Unsupported file type.');
    }

    // Split the content into chunks with overlaps
    console.log("Running embeddings...")
    return processContent(content);
};

export const processContent = async (content: string):Promise<string[]> => {
    const maxTokens = 500;    // Adjust based on desired chunk size
    const overlapTokens = 50; // Number of tokens to overlap between chunks
    return splitText(content, maxTokens, overlapTokens);
}
