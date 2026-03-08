import Email from '../models/Email.js';
import { fetchLast30DaysEmails, getGmailClient } from '../services/gmailService.js';
import { getEmbedding } from '../services/embeddingService.js';
import { initPinecone, upsertEmbeddings } from '../services/vectorService.js';

export const fetchEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tokens } = req.body; // OAuth tokens passed from the frontend after user authorizes Gmail
    
    if (!tokens) {
      return res.status(400).json({ error: 'Gmail OAuth tokens are required' });
    }

    const gmailClient = getGmailClient(tokens);
    const emails = await fetchLast30DaysEmails(gmailClient);
    
    if (emails.length === 0) {
      return res.json({ message: 'No recent emails found to process.' });
    }

    const pineconeIndex = initPinecone();
    const embeddingsBatch = [];

    // Process each email sequentially (or could be chunked/parallelized)
    for (const email of emails) {
      // Create metadata record in MongoDB
      await Email.create({ 
        userId, 
        subject: email.subject, 
        sender: email.sender, 
        date: new Date(email.date) 
      });

      // We need to embed the core text. 
      const emailContent = `Subject: ${email.subject}\nFrom: ${email.sender}\nDate: ${email.date}\nBody: ${email.body}`;
      
      try {
        const embedding = await getEmbedding(emailContent);
        embeddingsBatch.push({
          id: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          values: embedding,
          metadata: { 
            userId, 
            subject: email.subject, 
            sender: email.sender, 
            date: email.date, 
            emailBody: email.body.substring(0, 5000) // Truncate very large bodies for Pinecone metadata limits if needed
          }
        });
      } catch (embErr) {
        console.error('Failed to embed email:', embErr.message || embErr, 'Subject:', email.subject);
      }
    }

    await upsertEmbeddings(pineconeIndex, embeddingsBatch);
    res.json({ message: `Successfully fetched, embedded, and stored ${embeddingsBatch.length} emails.` });
  } catch (err) {
    console.error('Fetch emails error:', err);
    res.status(500).json({ error: err.message });
  }
};
