module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const configured = Boolean(process.env.AI_API_URL && process.env.AI_API_KEY && process.env.AI_MODEL);
  return res.status(200).json({ ok: true, configured });
};
