import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronDown,
  MapPin,
  Globe,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuthStore } from '../store/auth'
import RedTrackAPI from '../services/api'
import PeriodDropdown from './ui/PeriodDropdown'
import { getDateRange, periodPresets } from '../lib/utils'


interface GeographicData {
  id: string
  country: string
  region: string
  city: string
  visitors: number
  conversions: number
  revenue: number
  spend: number
  roi: number
  conversion_rate: number
  cpa: number
}

const Geographic: React.FC = () => {
  const { apiKey } = useAuthStore()
  const [geographicData, setGeographicData] = useState<GeographicData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    minVisitors: '',
    maxVisitors: '',
    minRevenue: '',
    maxRevenue: '',
    minRoi: '',
    maxRoi: '',
    dateFrom: '',
    dateTo: ''
  })
  const [tempFilters, setTempFilters] = useState(filters)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  // Remover periodOptions, getPeriodLabel, getDateRange antigos

  const loadGeographicData = async () => {
    if (!apiKey) return
    setLoading(true)
    try {
      const api = new RedTrackAPI(apiKey)
      const dateRange = getDateRange(selectedPeriod, customRange)
      
      console.log('Geografia - Parâmetros enviados:', {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      })
      
      const params = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        ...filters
      }
      const response = await api.getTracks(params)
      console.log('Geografia - Resposta da API:', response)
      
      // Se não houver dados, mostrar mensagem amigável
      if (!response || (Array.isArray(response.items) && response.items.length === 0)) {
        setGeographicData([])
      } else if (response.items) {
        setGeographicData(response.items)
      } else if (Array.isArray(response)) {
        setGeographicData(response)
      } else {
        setGeographicData([])
      }
    } catch (error) {
      console.error('Error loading geographic data:', error)
      // NÃO usar dados mock - mostrar dados reais vazios
      setGeographicData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (apiKey) {
      loadGeographicData()
    }
  }, [apiKey, selectedPeriod, filters])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.period-dropdown')) {
        // setShowPeriodDropdown(false) // This state is removed
      }
    }

    // if (showPeriodDropdown) { // This state is removed
    //   document.addEventListener('mousedown', handleClickOutside)
    // }

    return () => {
      // document.removeEventListener('mousedown', handleClickOutside) // This state is removed
    }
  }, []) // This state is removed

  // const handlePeriodChange = (period: string) => { // This function is removed
  //   setSelectedPeriod(period)
  //   setShowPeriodDropdown(false)
  // }

  const handleApplyFilters = () => {
    setFilters(tempFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      country: '',
      region: '',
      minVisitors: '',
      maxVisitors: '',
      minRevenue: '',
      maxRevenue: '',
      minRoi: '',
      maxRoi: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(resetFilters)
    setTempFilters(resetFilters)
  }

  const filteredData = geographicData.filter(data => {
    const matchesSearch = 
      data.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = !filters.country || data.country === filters.country
    const matchesRegion = !filters.region || data.region === filters.region
    const matchesMinVisitors = !filters.minVisitors || data.visitors >= parseFloat(filters.minVisitors)
    const matchesMaxVisitors = !filters.maxVisitors || data.visitors <= parseFloat(filters.maxVisitors)
    const matchesMinRevenue = !filters.minRevenue || data.revenue >= parseFloat(filters.minRevenue)
    const matchesMaxRevenue = !filters.maxRevenue || data.revenue <= parseFloat(filters.maxRevenue)
    const matchesMinRoi = !filters.minRoi || data.roi >= parseFloat(filters.minRoi)
    const matchesMaxRoi = !filters.maxRoi || data.roi <= parseFloat(filters.maxRoi)

    return matchesSearch && matchesCountry && matchesRegion && 
           matchesMinVisitors && matchesMaxVisitors && matchesMinRevenue && 
           matchesMaxRevenue && matchesMinRoi && matchesMaxRoi
  })

  // Calcular métricas
  const totalVisitors = filteredData.reduce((sum, d) => sum + d.visitors, 0)
  const totalConversions = filteredData.reduce((sum, d) => sum + d.conversions, 0)
  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0)
  const totalSpend = filteredData.reduce((sum, d) => sum + d.spend, 0)
  const averageRoi = filteredData.length > 0 
    ? filteredData.reduce((sum, d) => sum + d.roi, 0) / filteredData.length 
    : 0
  const averageConversionRate = filteredData.length > 0
    ? filteredData.reduce((sum, d) => sum + d.conversion_rate, 0) / filteredData.length
    : 0

  // Mensagem amigável e loading agora são exibidos dentro do fluxo principal, mantendo o filtro de período sempre visível

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Nav Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-2xl border border-white/20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Análise Geográfica
          </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
            Performance por localização geográfica
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setTempFilters(filters)
              setShowFilters(!showFilters)
            }}
            className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          </div>
        </div>
      </div>

      {/* Filtro de período padronizado */}
      <div className="flex items-center justify-between">
        <div className="relative period-dropdown">
        <PeriodDropdown
          value={selectedPeriod}
          customRange={customRange}
          onChange={(period, custom) => {
            setSelectedPeriod(period);
              const dateRange = getDateRange(period, custom);
            if (period === 'custom' && custom) {
              setCustomRange(custom);
            } else {
                setCustomRange({ from: '', to: '' });
            }
              setFilters(prev => ({
                ...prev,
                dateFrom: dateRange.startDate,
                dateTo: dateRange.endDate,
              }));
          }}
            presets={periodPresets}
        />
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-trackview-primary">Filtros Avançados</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Ocultar Filtros
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                País
              </label>
              <select 
                value={tempFilters.country}
                onChange={(e) => setTempFilters(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
              >
                <option value="">Todos</option>
                <option value="Brasil">Brasil</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="México">México</option>
                <option value="Argentina">Argentina</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Região
              </label>
              <select 
                value={tempFilters.region}
                onChange={(e) => setTempFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-trackview-text"
              >
                <option value="">Todas</option>
                <option value="Sudeste">Sudeste</option>
                <option value="Sul">Sul</option>
                <option value="Nordeste">Nordeste</option>
                <option value="Centro-Oeste">Centro-Oeste</option>
                <option value="Norte">Norte</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Visitantes Mínimos
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minVisitors}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minVisitors: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Visitantes Máximos
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxVisitors}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxVisitors: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Receita Mínima
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minRevenue}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minRevenue: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                Receita Máxima
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxRevenue}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxRevenue: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                ROI Mínimo
              </label>
              <Input 
                type="number"
                placeholder="0"
                value={tempFilters.minRoi}
                onChange={(e) => setTempFilters(prev => ({ ...prev, minRoi: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-trackview-text mb-2">
                ROI Máximo
              </label>
              <Input 
                type="number"
                placeholder="∞"
                value={tempFilters.maxRoi}
                onChange={(e) => setTempFilters(prev => ({ ...prev, maxRoi: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="primary"
              onClick={() => {
                setFilters(tempFilters)
                setShowFilters(false)
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-trackview-muted w-4 h-4" />
          <Input
            placeholder="Buscar localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Período Dropdown */}
        {/* This div is removed as the PeriodDropdown component handles its own dropdown */}
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-trackview-accent overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-trackview-background">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitantes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversões
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa de Conversão
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-trackview-background">
              {filteredData.map((data, index) => (
                <motion.tr 
                  key={data.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-trackview-background"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-trackview-muted mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {data.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.region}, {data.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {data.visitors.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {data.conversions.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {data.conversion_rate}%
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-green-600">
                      ${data.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-red-600">
                      ${data.spend.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {data.roi > 100 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${data.roi > 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.roi}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${data.cpa}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">Total Visitantes</p>
              <p className="text-2xl font-bold text-trackview-primary">
                {totalVisitors.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <Users className="w-6 h-6 text-trackview-secondary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">Total Conversões</p>
              <p className="text-2xl font-bold text-trackview-success">
                {totalConversions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <Globe className="w-6 h-6 text-trackview-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">Receita Total</p>
              <p className="text-2xl font-bold text-trackview-success">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <DollarSign className="w-6 h-6 text-trackview-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-trackview-accent"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-trackview-muted">ROI Médio</p>
              <p className="text-2xl font-bold text-trackview-success">
                {Math.round(averageRoi)}%
              </p>
            </div>
            <div className="p-3 bg-trackview-background rounded-lg">
              <BarChart3 className="w-6 h-6 text-trackview-success" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Geographic 