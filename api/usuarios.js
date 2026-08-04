// Vercel Serverless Function: api/usuarios.js
// Proxies Supabase REST API requests server-side safely

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization, Prefer');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
  
  // Preserve query parameters (e.g. ?email=eq... or ?id=eq...)
  const queryStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const supabaseTargetUrl = `https://qeplhebidpkkwxazbdmk.supabase.co/rest/v1/usuarios${queryStr}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'apikey': SUPABASE_SECRET_KEY,
        'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': req.headers['prefer'] || 'return=representation'
      }
    };

    if (['POST', 'PATCH', 'PUT'].includes(req.method) && req.body) {
      fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(supabaseTargetUrl, fetchOptions);
    const data = await response.json().catch(() => ({}));

    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Vercel Serverless Function Error:', err);
    return res.status(500).json({ error: 'Erro na Vercel Serverless Function', details: err.message });
  }
}
