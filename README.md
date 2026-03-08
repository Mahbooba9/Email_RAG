# Student Email RAG Assistant

A modern MERN stack application that allows users to sync their Gmail emails, store them in a Pinecone vector database using Hugging Face embeddings, and ask questions about them using Groq (LLaMA 3).

## Features
- **Gmail Integration**: Fetch recent emails securely via Google OAuth.
- **RAG (Retrieval-Augmented Generation)**: Uses vector search to find relevant context for AI answers.
- **Free AI Stack**: 
  - **Embeddings**: Hugging Face (`sentence-transformers/all-MiniLM-L6-v2`)
  - **LLM**: Groq (`llama-3.3-70b-versatile`)
- **Vector Database**: Pinecone
- **Modern UI**: Dark-themed, premium React dashboard.

## Tech Stack
- **Frontend**: React, Vite, CSS Modules
- **Backend**: Node.js, Express, MongoDB
- **AI**: Hugging Face Inference API, Groq SDK
- **Vector Search**: Pinecone

## Setup
1. Clone the repository.
2. Install dependencies for both frontend and backend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Set up environment variables in `backend/.env` and `frontend/.env` (see `.env.example` if available).
4. Run the development server:
   ```bash
   cd backend && npm run dev:all
   ```

## License
MIT
