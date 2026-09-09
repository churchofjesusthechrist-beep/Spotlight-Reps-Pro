import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Draft Message
  app.post('/api/draft-message', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const { scriptContent, restaurantName, contactName, sponsorName } = req.body;
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

      const prompt = `You are a helpful sales assistant.
Here is a message template:
"${scriptContent}"

Please draft a personalized version of this message using the following details:
Restaurant: ${restaurantName || 'Unknown'}
Contact: ${contactName || 'Unknown'}
Sponsor: ${sponsorName || 'Unknown'}

Make it sound natural, friendly, and professional. Return ONLY the drafted message content, no extra conversational text. Do not include placeholders, fill them in or adjust the text smoothly if details are missing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      res.json({ draft: response.text });
    } catch (e: any) {
      console.error("Error in draft-message:", e);
      res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  });

  // API Route: Suggest Sponsors
  app.post('/api/suggest-sponsors', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const { restaurantName, notes } = req.body;
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

      const prompt = `You are a local marketing expert.
I am selling sponsorships on a physical community board that will be placed inside this restaurant:
Restaurant Name: ${restaurantName || 'Unknown'}
Notes/Context: ${notes || 'None'}

Suggest 3 specific, highly relevant local business categories (e.g., luxury realtor, auto shop, dentist) that would benefit from advertising in this specific type of restaurant.
Explain briefly why for each.
Keep the response concise and format it as a bulleted list. Return ONLY the bulleted list.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      res.json({ suggestions: response.text });
    } catch (e: any) {
      console.error("Error in suggest-sponsors:", e);
      res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
