import { getEmbedding, generateAnswer } from '../services/embeddingService.js';
import { initPinecone, queryEmbeddings } from '../services/vectorService.js';

export const askQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1. Convert question to embedding
    const queryEmbedding = await getEmbedding(question);
    
    // 2. Search Pinecone for context
    const index = initPinecone();
    const results = await queryEmbeddings(index, queryEmbedding, userId);

    if (results.length === 0) {
      return res.json({ answer: 'I could not find any relevant emails to answer your question.' });
    }

    // 3. Format relevant emails for OpenAI context
    const contextText = results
      .map(e => `Subject: ${e.metadata.subject}\nFrom: ${e.metadata.sender}\nDate: ${e.metadata.date}\nBody: ${e.metadata.emailBody}`)
      .join('\n\n---\n\n');

    // 4. Generate answer based strictly on the context
    const answer = await generateAnswer(question, contextText);

    res.json({ answer, contextCount: results.length });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: err.message });
  }
};
