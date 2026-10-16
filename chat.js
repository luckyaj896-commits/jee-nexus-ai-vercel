function jsonError(res, status, error) {
  return res.status(status).json({ error });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return jsonError(res, 405, 'Method not allowed.');
  }

  const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_API_URL || !AI_API_KEY || !AI_MODEL) {
    return jsonError(res, 503, 'AI is not configured yet. Add AI_API_URL, AI_API_KEY, and AI_MODEL as server-side environment variables in Vercel.');
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return jsonError(res, 400, 'Send valid JSON.'); }
  }
  if (!body || typeof body !== 'object') return jsonError(res, 400, 'Send valid JSON.');

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return jsonError(res, 400, 'Please enter a question.');
  if (message.length > 6000) return jsonError(res, 413, 'Please keep each question under 6,000 characters.');

  const subject = ['Physics', 'Chemistry', 'Mathematics', 'General JEE'].includes(body.subject) ? body.subject : 'General JEE';
  const level = ['JEE Main', 'JEE Advanced', 'Build fundamentals'].includes(body.level) ? body.level : 'JEE Main';
  const system = `You are Nexus Tutor, a careful, encouraging JEE preparation tutor for Indian students. Focus: ${subject}; target: ${level}. Explain reasoning step by step, define symbols, show units where relevant, and distinguish verified facts from uncertainty. When a student asks a problem, prefer a hint-first approach if requested. Do not claim a question is an official PYQ unless you can verify it. Be age-appropriate.`;

  let upstream;
  try {
    upstream = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: message }
        ],
        temperature: 0.4,
        max_tokens: 1200
      })
    });
  } catch {
    return jsonError(res, 502, 'Could not connect to the AI provider. Check the API URL and try again.');
  }

  if (!upstream.ok) {
    return jsonError(res, 502, `AI provider returned HTTP ${upstream.status}. Check the provider URL, model, and key in Vercel settings.`);
  }

  let data;
  try { data = await upstream.json(); } catch {
    return jsonError(res, 502, 'The AI provider returned an unreadable response. This starter expects an OpenAI-compatible chat-completions API.');
  }
  const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    return jsonError(res, 502, 'The provider response did not contain choices[0].message.content. This starter expects an OpenAI-compatible chat-completions API.');
  }
  return res.status(200).json({ reply: reply.trim() });
};
