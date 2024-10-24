import express from 'express';
import multer from 'multer';
import cors from 'cors';
import {processContent, processFile} from './processFile';
import {answerQuestion, DocumentChunk} from './answerQuestion';
import {getEmbeddings} from "./getEmbedding";
import {getPageContent} from "./confluence";
import dotenv from 'dotenv';


const app = express();
const upload = multer({ dest: 'uploads/' });
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
let documents: DocumentChunk[] = [];

// Endpoint to upload files
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const chunks = await processFile(req.file!);

    // Get embeddings for all chunks
    const embeddings = await getEmbeddings(chunks);

    // Store each chunk with its embedding
    chunks.forEach((chunk, index) => {
      documents.push({
        id: `${req.file!.filename}-${index}`,
        content: chunk,
        embedding: embeddings[index],
      });
    });

    res.json({ message: 'File processed successfully.' });
  } catch (error: any) {
    console.error('File Processing Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'File processing failed.' });
  }
});

app.get('/confluence', async (req, res) => {
  try {
    const page = req.query.pageId as string
    const confluence = await getPageContent(page);
    const chunks = await processContent(confluence);
    const embeddings = await getEmbeddings(chunks);

    // Store each chunk with its embedding
    chunks.forEach((chunk, index) => {
      documents.push({
        id: `confluence-${index}`,
        content: chunk,
        embedding: embeddings[index],
      });
    });
    res.json({ message: 'Page processed successfully.' });
  } catch (error: any) {
    console.error('Page Processing Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Page processing failed.' });
  }
});

// Endpoint to ask questions
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await answerQuestion(question, documents);
    res.json({ answer });
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'An error occurred.',
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
