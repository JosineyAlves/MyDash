import React, { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Logo from './ui/Logo'
import { APP_URLS } from '../config/urls'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'login' | 'apiKey'>('login')
  const { testApiKey, setApiKey } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // TODO: Implementar autenticação real com Supabase
      // Por enquanto, vamos simular um login bem-sucedido
      if (email && password) {
        // Simular verificação de credenciais
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Se login bem-sucedido, ir para próximo passo
        setStep('apiKey')
      } else {
        setError('Por favor, preencha todos os campos')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const apiKeyInput = (e.target as HTMLFormElement).apiKey?.value
    
    if (apiKeyInput?.trim()) {
      setIsLoading(true)
      try {
        const isValid = await testApiKey(apiKeyInput.trim())
        if (isValid) {
          setApiKey(apiKeyInput.trim())
        } else {
          setError('API Key inválida. Verifique e tente novamente.')
        }
      } catch (err) {
        setError('Erro ao validar API Key. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    } else {
      setError('Por favor, insira sua API Key')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="modern-card p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="gradient" />
            </div>
            <p className="text-slate-600">
              {step === 'login' ? 'Faça login na sua conta' : 'Configure sua API Key'}
            </p>
            <div className="mt-4 text-sm text-slate-500">
              <p>Novo por aqui? </p>
              <a 
                href={APP_URLS.LANDING_PAGE} 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Conheça nossos planos
              </a>
            </div>
          </div>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="modern-input"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pr-10 modern-input"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                            </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleApiKeySubmit} className="space-y-6">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
                  API Key do RedTrack
                </label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua API Key..."
                    className="pr-10 modern-input"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Conecte sua conta RedTrack para acessar o dashboard
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Conectando...
                  </>
                ) : (
                  'Conectar API Key'
                )}
              </Button>

              <Button
                type="button"
                onClick={() => setStep('login')}
                variant="outline"
                className="w-full"
              >
                ← Voltar ao Login
              </Button>
            </form>
          )}

          {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
                {error.includes('401') && (
                  <div className="mt-3">
                    <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                    <ul className="text-xs text-red-500 space-y-1">
                      <li>• Verifique se a API Key está correta</li>
                      <li>• A API Key pode ter expirado - gere uma nova no RedTrack</li>
                      <li>• Certifique-se de que a API Key tem permissões adequadas</li>
                      <li>• Plano Solo pode ter acesso limitado - tente endpoints básicos primeiro</li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-600 font-medium">🔍 Testando endpoint /report...</p>
                      <p className="text-xs text-blue-500">Usando endpoint /report que é mais compatível com planos básicos do RedTrack</p>
                    </div>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-700 font-medium">⚠️ Informação do Plano:</p>
                      <p className="text-xs text-yellow-600">Plano Solo tem API access limitado. Considere upgrade para API completa.</p>
                    </div>
                  </div>
                )}
                {error.includes('403') && (
                  <div className="mt-3">
                    <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                    <ul className="text-xs text-red-500 space-y-1">
                      <li>• Verifique se a API Key tem permissões para acessar os dados</li>
                      <li>• Entre em contato com o administrador da conta RedTrack</li>
                    </ul>
                  </div>
                )}
                {error.includes('429') && (
                  <div className="mt-3">
                    <p className="text-xs text-red-500 mb-2">💡 Sugestões para resolver:</p>
                    <ul className="text-xs text-red-500 space-y-1">
                      <li>• Aguarde alguns minutos antes de tentar novamente</li>
                      <li>• Verifique o plano da sua conta RedTrack</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full modern-button"
              disabled={isLoading || !apiKeyInput.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                  Testando API Key...
                </>
              ) : (
                <>
                  🔑 Conectar ao RedTrack
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Sua API Key será salva localmente para facilitar o acesso futuro
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <a 
                href={APP_URLS.LANDING_PAGE} 
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Voltar à página principal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 