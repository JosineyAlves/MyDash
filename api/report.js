export default async function handler(req, res) {
  console.log('🔍 [REPORT] Requisição recebida:', req.method, req.url)
  console.log('🔍 [REPORT] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [REPORT] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [REPORT] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  // Extrai todos os parâmetros da query
  const params = { ...req.query };

  // Garante que a API Key está presente
  let apiKey = params.api_key;
  let frontendAuth = req.headers['authorization'];
  
  console.log('🔍 [REPORT] API Key da query:', apiKey ? 'SIM' : 'NÃO');
  console.log('🔍 [REPORT] Authorization header:', frontendAuth ? 'SIM' : 'NÃO');
  
  if (!apiKey && !frontendAuth) {
    console.log('❌ [REPORT] Nenhuma API Key fornecida');
    return res.status(401).json({ error: 'API Key required' });
  }

  // Usar API Key da query se disponível, senão do header
  const finalApiKey = apiKey || (frontendAuth ? frontendAuth.replace('Bearer ', '') : null);
  
  if (!finalApiKey) {
    console.log('❌ [REPORT] API Key final não encontrada');
    return res.status(401).json({ error: 'API Key required' });
  }

  // Monta a URL do RedTrack
  const url = new URL('https://api.redtrack.io/report');
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'api_key' && value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value.toString());
    }
  });
  
  // Adicionar API Key como parâmetro da query
  url.searchParams.set('api_key', finalApiKey);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TrackView-Dashboard/1.0'
  };

  try {
    console.log('🔍 [REPORT] URL final:', url.toString());
    console.log('🔍 [REPORT] Headers enviados:', headers);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔴 [REPORT] Erro da RedTrack:', {
        status: response.status,
        url: url.toString(),
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      return res.status(response.status).json({ 
        error: errorData.error || 'Erro na API do RedTrack',
        status: response.status,
        endpoint: '/report',
        redtrack: errorData
      });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message,
      endpoint: '/report'
    });
  }
} 