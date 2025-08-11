# 🚀 VMetrics - Dashboard RedTrack

Um dashboard profissional para análise de dados do RedTrack.io, construído com React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Zustand e localStorage.

## 🎯 Funcionalidades

### ✅ Implementadas
- **Autenticação via API Key** do RedTrack
- **Dashboard principal** com KPIs e gráficos
- **Tabelas de campanhas** com filtros e paginação
- **Análise de conversões** detalhada
- **Sidebar responsiva** com navegação
- **Configurações** para gerenciar API Key
- **Tema claro/escuro**
- **Dados simulados** para demonstração
- **Integração real** com API do RedTrack
- **Métricas personalizáveis** - Selecione quais métricas ver no dashboard
- **Configuração de moeda** - Seleção manual da moeda configurada na conta RedTrack

### 📊 Métricas Personalizáveis

O dashboard agora permite que cada gestor de tráfego personalize quais métricas quer ver:

#### **Métricas Básicas:**
- Cliques, Conversões, Gasto, Receita, Lucro
- Impressões, Impressões Visíveis, Cliques Únicos

#### **Métricas de Performance:**
- ROI, CPA, CPC, CTR, Taxa de Conversão
- ROAS, ROAS Conversão, CPA Total, CPT

#### **Métricas de Conversão:**
- Todas Conversões, Transações
- Pre-LP Views/Clicks/CTR, LP CTR
- Taxa Conversão CR, Taxa Todas Conversões

#### **Métricas de Receita:**
- Receita por Conversão, Receita Publisher
- AOV Total, AOV Conversão

#### **Métricas de Earnings:**
- EPV, EPLPC, EPUC, Listicle EPV, EPC ROI

#### **Métricas de Aprovação:**
- Aprovadas, Pendentes, Recusadas
- Taxa Aprovação, Taxa Pendente, Taxa Recusa

## 💰 Configuração de Moeda

O VMetrics permite configurar manualmente a moeda da sua conta RedTrack através de um dropdown simples. Isso garante que todos os valores monetários sejam exibidos na moeda correta, independentemente do país ou configuração da conta.

### 🔍 Como Funciona
1. **Seleção Manual**: Escolha diretamente a moeda configurada no seu RedTrack através do dropdown
2. **Interface Simples**: Dropdown com 12 moedas principais incluindo BRL, USD, EUR, GBP, etc.
3. **Aplicação Imediata**: A moeda selecionada é aplicada instantaneamente em todo o dashboard
4. **Persistência**: A moeda configurada é salva localmente e reutilizada em futuras sessões

### 🌍 Moedas Suportadas
- **Américas**: BRL, USD, CAD, MXN, ARS, CLP, COP, PEN, UYU, VEF, VES, BOL, PYG, BOB, GTQ, HNL, NIO, CRC, PAB, DOP, HTG, JMD, TTD, BBD, XCD, ANG, AWG, SRD, GYD, SBD
- **Europa**: EUR, GBP, GIP, FKP, SHP, IMP, JEP, GGP
- **Ásia**: JPY, CNY, KRW, THB, MYR, IDR, PHP, VND, KHR, LAK, MMK, BDT, LKR, NPR, PKR, AFN, IRR, IQD, JOD, KWD, LBP, OMR, QAR, SAR, SYP, AED, YER
- **África**: EGP, DZD, MAD, TND, LYD, SDG, ETB, KES, TZS, UGX, NGN, GHS, ZAR, BWP, NAD, ZMW, MWK, ZWL, MUR, SCR, SZL, LSL, MZN, CVE, STD, XOF, XAF, XPF, GMD, GNF, SLL, LRD, SLE, AOA, CDF
- **Oceania**: AUD, FJD, NZD
- **Outros**: SGD, HKD, TWD, INR

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/JosineyAlves/VMetrics.git
cd VMetrics
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure a API Key do RedTrack:**
   - Acesse o RedTrack.io
   - Vá em Settings > API
   - Copie sua API Key

### Desenvolvimento

Para rodar o projeto em modo de desenvolvimento com servidor de API:

```bash
# Instalar dependências do servidor (se necessário)
npm install express cors concurrently

# Rodar servidor de API + frontend
npm run dev:full
```

Ou rodar separadamente:

```bash
# Terminal 1 - Servidor de API
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

### Produção

```bash
# Build do projeto
npm run build

# Rodar servidor de produção
npm run dev:server
```

## 🎯 Como Usar

### 1. Login
- Insira sua API Key do RedTrack
- Clique em "Conectar ao RedTrack"

### 2. Dashboard Personalizado
- Clique no botão "Métricas" no Dashboard
- Selecione quais métricas deseja ver
- Organize por categoria (Básicas, Performance, etc.)
- Clique em "Aplicar"

### 3. Navegação
- **Dashboard** - Visão geral com KPIs e gráficos
- **Campanhas** - Tabela com filtros e busca
- **Conversões** - Detalhes de conversões com exportação
- **Geografia** - Dados geográficos
- **Configurações** - Gerenciamento de API key

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/            # Componentes UI (shadcn/ui)
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── Campaigns.tsx  # Tabela de campanhas
│   ├── Conversions.tsx # Análise de conversões
│   ├── Settings.tsx   # Configurações
│   ├── Sidebar.tsx    # Navegação lateral
│   ├── LoginForm.tsx  # Formulário de login
│   └── MetricsSelector.tsx # Seletor de métricas
├── store/             # Gerenciamento de estado (Zustand)
│   ├── auth.ts        # Store de autenticação
│   ├── dateRange.ts   # Store de datas
│   └── metrics.ts     # Store de métricas personalizáveis
├── services/          # Serviços da API
│   └── api.ts         # Cliente da API RedTrack
├── lib/               # Utilitários
│   └── utils.ts       # Funções utilitárias
└── App.tsx           # Componente principal

api/                   # Endpoints da API (proxy para RedTrack)
├── report.js         # Relatórios
├── campaigns.js      # Campanhas
├── conversions.js    # Conversões
├── tracks.js         # Cliques
├── settings.js       # Configurações
└── dictionaries.js   # Dicionários

server.js             # Servidor de desenvolvimento
```

## 📡 Endpoints da API

Baseado na [documentação oficial do RedTrack](https://help.redtrack.io/), implementamos:

### ✅ Endpoints Funcionais
- `GET /report` - Dados do dashboard
- `GET /conversions` - Log de conversões
- `GET /campaigns` - Lista de campanhas
- `GET /tracks` - Log de cliques
- `GET /settings` - Configurações da conta
- `GET /dictionaries` - Dados de referência

## 🎨 Design System

### Cores
- **Primária**: Azul (#3B82F6)
- **Sucesso**: Verde (#10B981)
- **Aviso**: Amarelo (#F59E0B)
- **Erro**: Vermelho (#EF4444)

### Componentes
- **Border radius**: 0.5rem (8px)
- **Shadows**: Suaves e consistentes
- **Spacing**: Sistema 4px (0.25rem)

## 🔧 Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State**: Zustand
- **Backend**: Express.js (desenvolvimento)
- **API**: RedTrack.io

## 📝 Licença

Este projeto é privado e desenvolvido para uso interno.

## 🤝 Suporte

Para suporte técnico ou dúvidas sobre integração com RedTrack, entre em contato com a equipe de desenvolvimento. 

## 🌐 Links

* **Repositório**: https://github.com/JosineyAlves/VMetrics
* **Site**: https://vmetrics.com.br 