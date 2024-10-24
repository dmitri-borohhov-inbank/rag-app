# RAG Application

This is a Retrieval-Augmented Generation (RAG) application that integrates with Confluence to upload documents, index pages, and answer questions based on the indexed content. The application is built using Node.js, TypeScript, and Express.

## Features

- Upload documents and process their content.
- Index Confluence pages by their Page ID.
- Ask questions based on the indexed content.
- Returns answers to questions using the indexed document chunks.

## Prerequisites

- Node.js (version >= 14.x)
- TypeScript
- A Confluence account with API access
- A personal access token for Confluence API

## Getting Started


1. Install Dependencies
Run the following command to install the necessary packages:

```npm install```

2. Create a .env File
In the root directory of the project, create a .env file and add your Confluence personal access token:

```
CONFLUENCE_TOKEN=your_personal_access_token
OPENAI_KEY=your_openai_key
```

3. Run the Application
To run the application in development mode, use the following command:

```npm run dev```