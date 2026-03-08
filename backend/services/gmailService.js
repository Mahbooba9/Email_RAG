import { google } from 'googleapis';

export const getGmailClient = (tokens) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: tokens.access_token });
  return google.gmail({ version: 'v1', auth: oAuth2Client });
};

export const fetchLast30DaysEmails = async (client) => {
  console.log("Starting Gmail fetch...");
  try {
    const res = await client.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: '' // explicitly empty query to fetch everything
    });

    console.log("Raw Google API messages.list response:", res.data);

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} message IDs.`);
    
    const emails = [];
    
    for (const msg of messages) {
    try {
      const data = await client.users.messages.get({ 
        userId: 'me', 
        id: msg.id, 
        format: 'full' 
      });
      
      const payload = data.data.payload;
      const headers = payload.headers.reduce((acc, h) => ({...acc, [h.name]: h.value}), {});
      
      // Basic extraction of email body (might be in parts or direct body)
      let bodyData = payload.body?.data || '';
      if (!bodyData && payload.parts) {
        // Try to find plain text part
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart) bodyData = textPart.body?.data || '';
        // Fallback to first part if no plain text
        else bodyData = payload.parts[0]?.body?.data || '';
      }

      const bodyText = bodyData ? Buffer.from(bodyData, 'base64').toString('utf8') : '';

      emails.push({
        subject: headers.Subject || '(No Subject)',
        sender: headers.From || '(Unknown Sender)',
        date: headers.Date || new Date().toISOString(),
        body: bodyText
      });
    } catch (e) {
      console.error(`Error fetching email ${msg.id}:`, e);
      // Skip if fetching one email fails
    }
    }
    return emails;
  } catch (globalErr) {
    console.error("Fatal error fetching from Gmail API:", globalErr);
    throw globalErr;
  }
};
