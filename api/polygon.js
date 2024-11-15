export default async function handler(req, res) {
    const { ticker, startDate, endDate } = req.query; // Extract query parameters from the request

    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allows only GET and OPTIONS methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Specifies allowed headers
  
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    if (!ticker || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters: ticker, startDate, or endDate' });
    }
  
    const polygonApiKey = process.env.POLYGON_API_KEY; // Make sure your key is stored securely
    const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?apiKey=${polygonApiKey}`;
  
    try {
      const response = await fetch(polygonUrl);
  
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return res.status(200).json(data); // Respond with the Polygon data
    } catch (error) {
      console.error('Error fetching data from Polygon API:', error.message);
      return res.status(500).json({ error: 'Failed to fetch stock data from Polygon API' });
    }
  }