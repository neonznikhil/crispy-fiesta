export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  const model = process.env.AI_MODEL || 'llama-3.1-8b-instant';

  if (!apiKey) {
    return res.status(500).json({
      reply: 'The AI assistant is currently offline. Please leave your email and our team will respond within 24 hours.'
    });
  }

  const systemPrompt = `You are the Digital Pro Now (DPN) assistant. Answer accurately and briefly.

SITE CONTENT (use only this):
- DPN offers a done-for-you digital business system with complete automation.
- Target audience: busy parents, burned-out professionals, 9-5 workers.
- Free community: WYP x Digital Growth Community (70,000+ members).
- Topics: AI, automation, personal branding, business building, faith, community.
- Call to action: get the free blueprint by entering an email address on the page.
- Mission quote: "This isn't just about making money — it's about helping people discover their God-given talents, build meaningful lives, serve others, create freedom, strengthen families, and make a lasting impact in their communities."
- René Manfre is the Career & Business Coach (What's Your Passion).
- Member count: 70,000+ already transforming.
- No fluff: practical lessons, proven frameworks, workshops, videos, articles, podcasts.
- Earnings disclaimer: results vary, not guaranteed, individual effort required.

RULES:
- Keep replies under 2 sentences.
- Be warm and helpful.
- If unsure, say you'll connect the user with the team and ask for their email.
- Always try to naturally guide users toward the free blueprint / email signup when appropriate.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(messages) ? messages : [])
        ],
        max_tokens: 256,
        temperature: 0.25
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('AI provider error:', response.status, text);
      return res.status(502).json({
        reply: 'I’m having trouble connecting right now. Please drop your email and the team will get back to you soon.'
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ||
      'Thanks for your question! For the best answers, please leave your email and our team will help you directly.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat backend error:', err);
    return res.status(502).json({
      reply: 'Something went wrong on our end. Please try again or leave your email and we’ll follow up.'
    });
  }
}
