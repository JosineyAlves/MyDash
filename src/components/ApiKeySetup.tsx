import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import { APP_URLS } from '../config/urls'
import AuthService from '../services/authService'

interface ApiKeySetupProps {
  onComplete: () => void
  onSkip?: () => void
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete, onSkip }) => {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const { testApiKey, setApiKey: setAuthApiKey } = useAuthStore()

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira uma API Key válida')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const isValid = await testApiKey(apiKey)
      
      if (isValid) {
        // API Key válida - salvar no banco e continuar
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          const saved = await AuthService.saveApiKey(currentUser.id, apiKey)
          if (saved) {
            console.log('✅ API Key salva no banco com sucesso')
          } else {
            console.warn('⚠️ Erro ao salvar API Key no banco')
          }
        }
        
        // Salvar no store local também
        setAuthApiKey(apiKey)
        onComplete()
      } else {
        setError('API Key inválida. Verifique se está correta e tem permissões adequadas.')
      }
    } catch (err) {
      setError('Erro ao testar API Key. Tente novamente.')
      console.error('Erro ao testar API Key:', err)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      // Redirecionar para dashboard sem API Key
      window.location.href = APP_URLS.DASHBOARD
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Insira sua API Key para acessar o dashboard
            </h1>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key do RedTrack
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="rt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full"
                disabled={isLoading}
              />
                             <p className="text-xs text-gray-500 mt-1">
                 Encontre sua API Key no painel do RedTrack
               </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleTestApiKey}
                disabled={!apiKey.trim() || isLoading || isValidating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Testando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Testar e Configurar
                  </>
                )}
              </Button>

              {onSkip && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Configurar Depois
                </Button>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Acesse Settings → API no RedTrack para gerar sua chave
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              API Key salva automaticamente
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ApiKeySetup
