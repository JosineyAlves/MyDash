export default async function handler(req, res) {
  console.log('🔍 [SETTINGS] Requisição recebida:', req.method, req.url)
  console.log('🔍 [SETTINGS] Headers recebidos:', Object.keys(req.headers))
  console.log('🔍 [SETTINGS] Authorization header:', req.headers['authorization'])
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 [SETTINGS] Preflight request - retornando 200')
    res.status(200).end()
    return
  }

  const authHeader = req.headers['authorization']
  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : null
  
  console.log('🔍 [SETTINGS] API Key extraída:', apiKey ? 'SIM' : 'NÃO')
  
  if (!apiKey) {
    console.log('❌ [SETTINGS] API Key não fornecida')
    return res.status(401).json({ error: 'API Key required' })
  }



  try {
    console.log('🔍 [SETTINGS] Testando API Key com múltiplos endpoints...')
    console.log('🔍 [SETTINGS] API Key sendo testada:', apiKey)
    
    // Testar múltiplos endpoints para encontrar um que funcione
    // Endpoints ordenados do mais básico ao mais avançado
    const endpoints = [
      'https://api.redtrack.io/report?group_by=campaign&date_from=2024-01-01&date_to=2024-12-31',
      'https://api.redtrack.io/conversions?limit=1',
      'https://api.redtrack.io/campaigns?limit=1',
      'https://api.redtrack.io/me/settings'
    ]
    
    let workingEndpoint = null
    let response = null
    
    for (const endpoint of endpoints) {
      console.log(`🔍 [SETTINGS] Testando endpoint: ${endpoint}`)
      
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'TrackView-Dashboard/1.0'
          }
        })
        
        console.log(`🔍 [SETTINGS] Status para ${endpoint}:`, response.status)
        
        if (response.ok) {
          workingEndpoint = endpoint
          console.log(`✅ [SETTINGS] Endpoint funcionando: ${endpoint}`)
          break
        }
      } catch (error) {
        console.log(`❌ [SETTINGS] Erro ao testar ${endpoint}:`, error.message)
        continue
      }
    }
    
    if (!workingEndpoint) {
      console.log('❌ [SETTINGS] Nenhum endpoint funcionou com esta API Key')
      return res.status(401).json({ 
        error: 'API Key inválida ou sem permissões para nenhum endpoint',
        details: 'Testados: /report, /conversions, /campaigns, /me/settings',
        suggestions: [
          'Verifique se a API Key está correta',
          'A API Key pode ter expirado - gere uma nova no RedTrack',
          'Certifique-se de que a API Key tem permissões adequadas',
          'Plano Solo pode ter acesso limitado - tente endpoints básicos primeiro',
          'Considere fazer upgrade para plano Team/Enterprise para API completa'
        ],
        planInfo: {
          current: 'Solo',
          limitations: 'API access limitado',
          recommendation: 'Teste endpoints básicos ou faça upgrade'
        }
      })
    }

    console.log('🔍 [SETTINGS] Status da resposta:', response.status)
    console.log('🔍 [SETTINGS] Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.log('❌ [SETTINGS] Erro na resposta:', errorData)
      
      // Mensagens de erro mais específicas
      let errorMessage = 'API Key inválida ou erro na API do RedTrack'
      let suggestions = []
      
      if (response.status === 401) {
        errorMessage = 'API Key inválida ou expirada'
        suggestions = [
          'Verifique se a API Key está correta',
          'A API Key pode ter expirado - gere uma nova no RedTrack',
          'Certifique-se de que a API Key tem permissões adequadas'
        ]
      } else if (response.status === 403) {
        errorMessage = 'Acesso negado - API Key sem permissões'
        suggestions = [
          'Verifique se a API Key tem permissões para acessar os dados',
          'Entre em contato com o administrador da conta RedTrack'
        ]
      } else if (response.status === 429) {
        errorMessage = 'Limite de requisições excedido'
        suggestions = [
          'Aguarde alguns minutos antes de tentar novamente',
          'Verifique o plano da sua conta RedTrack'
        ]
      }
      
      return res.status(response.status).json({ 
        error: errorMessage,
        details: errorData,
        suggestions: suggestions,
        status: response.status
      })
    }

    const data = await response.json()
    console.log('✅ [SETTINGS] Dados recebidos com sucesso do endpoint:', workingEndpoint)
    res.status(200).json({
      ...data,
      workingEndpoint: workingEndpoint,
      message: 'API Key válida! Conectado com sucesso ao RedTrack.'
    })
    
  } catch (error) {
    console.error('❌ [SETTINGS] Erro ao conectar com RedTrack:', error)
    console.error('❌ [SETTINGS] Tipo do erro:', typeof error)
    console.error('❌ [SETTINGS] Mensagem do erro:', error.message)
    res.status(500).json({ 
      error: 'Erro de conexão com a API do RedTrack',
      details: error.message 
    })
  }
} 