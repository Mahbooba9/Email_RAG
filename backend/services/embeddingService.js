import { HfInference } from '@huggingface/inference';
import Groq from 'groq-sdk';

let hf;
const getHf = () => {
  if (!hf) {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is missing in .env");
    }
    hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }
  return hf;
};

let groq;
const getGroq = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in .env");
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export const getEmbedding = async (text) => {
  const ai = getHf();
  // all-MiniLM-L6-v2 outputs 384 dimensions
  const result = await ai.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  });
  
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result.flat(Infinity);
  }
  return Array.isArray(result) ? result.flat(Infinity) : result;
};

export const generateAnswer = async (question, contextText) => {
  const g = getGroq();
  // Using llama-3.3-70b-versatile on Groq for blazing fast free inference
  const res = await g.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { 
        role: 'system', 
        content: 'You are an assistant answering questions based strictly on the provided user emails context. If the answer is not in the context, kindly specify that you do not see it.' 
      },
      { 
        role: 'user', 
        content: `Context:\n${contextText}\n\nQuestion: ${question}` 
      }
    ]
  });
  return res.choices[0].message.content;
};
