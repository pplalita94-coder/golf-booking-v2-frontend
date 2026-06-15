export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const gasUrl = process.env.GAS_WEB_APP_URL;

  if (!gasUrl) {
    return res.status(500).json({
      success: false,
      message: 'Missing GAS_WEB_APP_URL environment variable'
    });
  }

  try {
    const payload =
      typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body || {});

    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: payload
    });

    const text = await gasResponse.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (parseError) {
      return res.status(502).json({
        success: false,
        message: 'Invalid response from GAS',
        raw: text.slice(0, 500)
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Proxy request failed'
    });
  }
}
