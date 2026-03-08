import { Pinecone } from '@pinecone-database/pinecone';

let pcClient;

export const initPinecone = () => {
  if (!pcClient) {
    pcClient = new Pinecone({ 
      apiKey: process.env.PINECONE_API_KEY 
    });
  }
  const indexName = process.env.PINECONE_INDEX || 'email-rag';
  return pcClient.index(indexName);
};

export const upsertEmbeddings = async (index, items) => {
  if (items.length === 0) return;
  // Upsert in batches to avoid payload limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    try {
      await index.upsert(batch); // Try native v7 passing array
    } catch (e) {
      if (e.message.includes("Must pass in at least 1 record")) {
        await index.upsert({ records: batch }); // Fallback to named parameter
      } else {
        throw e;
      }
    }
  }
};

export const queryEmbeddings = async (index, embedding, userId, threshold = 0.4) => {
  console.log(`Querying Pinecone for userId: ${userId} with threshold: ${threshold}`);
  const res = await index.query({
    vector: embedding,
    topK: 10, 
    includeMetadata: true,
    filter: { userId } 
  });
  
  console.log(`Found ${res.matches.length} total matches before threshold filtering`);
  res.matches.forEach((m, i) => {
    console.log(`Match ${i+1}: Score: ${m.score}, Subject: ${m.metadata?.subject}`);
  });

  // Return all matches, let the LLM filter relevance
  return res.matches;
};
