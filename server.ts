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

  // API Route: Find Prospects (AI-sourced leads using live web search)
  app.post('/api/find-prospects', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const { location, prospectType, count = 8 } = req.body;
      if (!location || !prospectType) {
        return res.status(400).json({ error: 'location and prospectType are required.' });
      }

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

      const targetDescription = prospectType === 'Restaurant'
        ? 'independent, locally-owned restaurants (not big chains) that would be a good fit for a free in-store community spotlight board'
        : 'small local businesses (realtors, dentists, auto shops, contractors, insurance agents, etc.) that would want to sponsor an ad spot on a community board inside a local restaurant';

      const prompt = `Search the web and find ${count} real ${targetDescription} located in or near "${location}".

For each one, only include it if you found real, current information about it online. Do not invent or guess details.

Return ONLY a JSON array (no markdown fences, no extra text) where each item has this exact shape:
{
  "businessName": string,
  "contactName": string or null,
  "phone": string or null,
  "email": string or null,
  "address": string or null,
  "website": string or null,
  "reasonFlagged": string (one short sentence on why this is a good lead, e.g. "no website found" or "highly rated, busy foot traffic, no visible ad partnerships")
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      let text = (response.text || '').trim();
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      let leads: any[] = [];
      try {
        leads = JSON.parse(text);
      } catch (parseErr) {
        console.error('Failed to parse prospect JSON:', text);
        return res.status(500).json({ error: 'AI response could not be parsed. Try again.' });
      }

      res.json({ leads });
    } catch (e: any) {
      console.error('Error in find-prospects:', e);
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
