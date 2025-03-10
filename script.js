// Script de automação para operações em pools de liquidez Solana
// Plataformas: Meteora, Orca e Raydium

// Verificar e acessar as bibliotecas carregadas como variáveis globais
const solanaWeb3 = window.solanaWeb3js || window.solana;
const { Connection, PublicKey } = solanaWeb3;
const axios = window.axios;

// Configuração da aplicação
const CONFIG = {
  allocations: {
    meteora: 0.33,    // 33% para Meteora (Solana)
    orca: 0.33,       // 33% para Orca (Solana)
    raydium: 0.34     // 34% para Raydium (Solana)
  },
  rebalanceThreshold: 0.05,  // Rebalancear quando o rendimento diferir em 5%
  refreshInterval: 3600000,  // Verificar rendimentos a cada hora (em ms)
  slippageTolerance: 0.005   // 0.5% de tolerância de slippage
};

// Classe principal para gerenciar operações
class LiquidityPoolManager {
  constructor() {
    this.initialized = false;
    this.solanaConnection = null;
    this.walletAddresses = {
      solana: null
    };
    this.platformAPYs = {
      meteora: 0,
      orca: 0,
      raydium: 0
    };
    this.currentAllocations = { ...CONFIG.allocations };
  }

  // Inicializar conexões e carteiras
  async initialize() {
    try {
      // Verificar se o Phantom está instalado
      if (window.solana && window.solana.isPhantom) {
        await this.connectPhantom();
      } else {
        throw new Error("Phantom wallet não encontrada. Por favor, instale a extensão Phantom.");
      }

      this.initialized = true;
      console.log("Inicialização concluída com sucesso");
      
      // Iniciar processo de monitoramento
      this.startMonitoring();
      return true;
    } catch (error) {
      console.error("Erro na inicialização:", error);
      return false;
    }
  }

  // Conectar à carteira Phantom (Solana)
  async connectPhantom() {
    try {
      // Solicitar conexão ao Phantom
      const resp = await window.solana.connect();
      this.walletAddresses.solana = resp.publicKey.toString();
      console.log("Carteira Solana conectada:", this.walletAddresses.solana);
      
      // Inicializar conexão Solana
      this.solanaConnection = new Connection("https://api.mainnet-beta.solana.com");
      
      return true;
    } catch (error) {
      console.error("Erro ao conectar à carteira Phantom:", error);
      throw error;
    }
  }

  // Iniciar monitoramento dos rendimentos
  startMonitoring() {
    if (!this.initialized) {
      console.error("Sistema não inicializado. Execute initialize() primeiro.");
      return false;
    }

    // Verificar rendimentos imediatamente e depois periodicamente
    this.checkYields();
    setInterval(() => this.checkYields(), CONFIG.refreshInterval);
    
    console.log("Monitoramento iniciado. Verificando rendimentos a cada", 
                CONFIG.refreshInterval / 60000, "minutos");
    return true;
  }

  // Verificar rendimentos de todas as plataformas
  async checkYields() {
    try {
      // Obter rendimentos atuais de cada plataforma
      const [meteoraAPY, orcaAPY, raydiumAPY] = await Promise.all([
        this.getMeteoraAPY(),
        this.getOrcaAPY(),
        this.getRaydiumAPY()
      ]);
      
      // Atualizar valores de APY
      this.platformAPYs = {
        meteora: meteoraAPY,
        orca: orcaAPY,
        raydium: raydiumAPY
      };
      
      console.log("APYs atuais:", this.platformAPYs);
      
      // Verificar se rebalanceamento é necessário
      this.checkRebalance();
    } catch (error) {
      console.error("Erro ao verificar rendimentos:", error);
    }
  }

  // Verificar se rebalanceamento é necessário
  checkRebalance() {
    const platforms = Object.keys(this.platformAPYs);
    const totalAPY = platforms.reduce((sum, platform) => sum + this.platformAPYs[platform], 0);
    const avgAPY = totalAPY / platforms.length;
    
    // Verificar se alguma plataforma está significativamente acima ou abaixo da média
    const needsRebalance = platforms.some(platform => {
      const deviation = Math.abs(this.platformAPYs[platform] - avgAPY) / avgAPY;
      return deviation > CONFIG.rebalanceThreshold;
    });
    
    if (needsRebalance) {
      console.log("Rebalanceamento necessário. Recalculando alocações...");
      this.calculateOptimalAllocations();
    } else {
      console.log("Alocações atuais estão dentro do limite. Nenhuma ação necessária.");
    }
  }

  // Calcular alocações ótimas baseadas nos rendimentos
  calculateOptimalAllocations() {
    const platforms = Object.keys(this.platformAPYs);
    const totalAPY = platforms.reduce((sum, platform) => sum + this.platformAPYs[platform], 0);
    
    // Calcular nova alocação proporcional aos APYs
    const newAllocations = {};
    platforms.forEach(platform => {
      newAllocations[platform] = this.platformAPYs[platform] / totalAPY;
    });
    
    console.log("Novas alocações calculadas:", newAllocations);
    
    // Comparar com alocações atuais e executar rebalanceamento se necessário
    this.executeRebalance(newAllocations);
  }

  // Executar rebalanceamento entre plataformas
  async executeRebalance(newAllocations) {
    try {
      console.log("Executando rebalanceamento...");
      console.log("Alocações antigas:", this.currentAllocations);
      console.log("Alocações novas:", newAllocations);
      
      // Implementar lógica para realocar fundos:
      // 1. Retirar de plataformas com alocação reduzida
      // 2. Adicionar em plataformas com alocação aumentada
      
      // Exemplo de implementação:
      for (const platform of Object.keys(newAllocations)) {
        const currentAlloc = this.currentAllocations[platform];
        const newAlloc = newAllocations[platform];
        const difference = newAlloc - currentAlloc;
        
        if (difference > 0.01) {  // Aumentar alocação
          console.log(`Aumentando alocação em ${platform} em ${(difference * 100).toFixed(2)}%`);
          await this.addLiquidity(platform, difference);
        } else if (difference < -0.01) {  // Reduzir alocação
          console.log(`Reduzindo alocação em ${platform} em ${(Math.abs(difference) * 100).toFixed(2)}%`);
          await this.removeLiquidity(platform, Math.abs(difference));
        }
      }
      
      // Atualizar alocações atuais
      this.currentAllocations = { ...newAllocations };
      console.log("Rebalanceamento concluído com sucesso");
    } catch (error) {
      console.error("Erro ao executar rebalanceamento:", error);
    }
  }

  // Adicionar liquidez a uma plataforma específica
  async addLiquidity(platform, allocationDelta) {
    switch (platform) {
      case 'meteora':
        await this.addLiquidityMeteora(allocationDelta);
        break;
      case 'orca':
        await this.addLiquidityOrca(allocationDelta);
        break;
      case 'raydium':
        await this.addLiquidityRaydium(allocationDelta);
        break;
    }
  }

  // Remover liquidez de uma plataforma específica
  async removeLiquidity(platform, allocationDelta) {
    switch (platform) {
      case 'meteora':
        await this.removeLiquidityMeteora(allocationDelta);
        break;
      case 'orca':
        await this.removeLiquidityOrca(allocationDelta);
        break;
      case 'raydium':
        await this.removeLiquidityRaydium(allocationDelta);
        break;
    }
  }

  // ------ Implementações específicas para cada plataforma ------

  // Obter APY atual do Meteora
  async getMeteoraAPY() {
    try {
      // Implementação para Meteora
      // Exemplo: consultar uma API ou calcular com base nos dados da blockchain
      const response = await axios.get('https://api.example.com/meteora/apy');
      return response.data.apy || 0.06;  // Valor default para teste
    } catch (error) {
      console.error("Erro ao obter APY do Meteora:", error);
      return 0.06;  // Valor default em caso de erro
    }
  }

  // Obter APY atual do Orca
  async getOrcaAPY() {
    try {
      // Implementação para Orca
      const response = await axios.get('https://api.example.com/orca/apy');
      return response.data.apy || 0.055;  // Valor default para teste
    } catch (error) {
      console.error("Erro ao obter APY do Orca:", error);
      return 0.055;
    }
  }

  // Obter APY atual do Raydium
  async getRaydiumAPY() {
    try {
      // Implementação para Raydium
      const response = await axios.get('https://api.example.com/raydium/apy');
      return response.data.apy || 0.065;  // Valor default para teste
    } catch (error) {
      console.error("Erro ao obter APY do Raydium:", error);
      return 0.065;
    }
  }

  // Adicionar liquidez no Meteora (Solana)
  async addLiquidityMeteora(allocationDelta) {
    try {
      console.log(`Adicionando liquidez no Meteora. Delta: ${allocationDelta}`);
      // Implementar lógica para adicionar liquidez no Meteora usando Solana Web3.js
      // Este é um exemplo simplificado
      return true;
    } catch (error) {
      console.error("Erro ao adicionar liquidez no Meteora:", error);
      throw error;
    }
  }

  // Adicionar liquidez no Orca (Solana)
  async addLiquidityOrca(allocationDelta) {
    try {
      console.log(`Adicionando liquidez no Orca. Delta: ${allocationDelta}`);
      // Implementar lógica para adicionar liquidez no Orca
      return true;
    } catch (error) {
      console.error("Erro ao adicionar liquidez no Orca:", error);
      throw error;
    }
  }

  // Adicionar liquidez no Raydium (Solana)
  async addLiquidityRaydium(allocationDelta) {
    try {
      console.log(`Adicionando liquidez no Raydium. Delta: ${allocationDelta}`);
      // Implementar lógica para adicionar liquidez no Raydium
      return true;
    } catch (error) {
      console.error("Erro ao adicionar liquidez no Raydium:", error);
      throw error;
    }
  }

  // Remover liquidez do Meteora
  async removeLiquidityMeteora(allocationDelta) {
    try {
      console.log(`Removendo liquidez do Meteora. Delta: ${allocationDelta}`);
      // Implementar lógica para remover liquidez do Meteora
      return true;
    } catch (error) {
      console.error("Erro ao remover liquidez do Meteora:", error);
      throw error;
    }
  }

  // Remover liquidez do Orca
  async removeLiquidityOrca(allocationDelta) {
    try {
      console.log(`Removendo liquidez do Orca. Delta: ${allocationDelta}`);
      // Implementar lógica para remover liquidez do Orca
      return true;
    } catch (error) {
      console.error("Erro ao remover liquidez do Orca:", error);
      throw error;
    }
  }

  // Remover liquidez do Raydium
  async removeLiquidityRaydium(allocationDelta) {
    try {
      console.log(`Removendo liquidez do Raydium. Delta: ${allocationDelta}`);
      // Implementar lógica para remover liquidez do Raydium
      return true;
    } catch (error) {
      console.error("Erro ao remover liquidez do Raydium:", error);
      throw error;
    }
  }
}

// Código para interface web
class LiquidityPoolUI {
  constructor() {
    this.manager = new LiquidityPoolManager();
    this.initialized = false;
    this.darkMode = false;
  }
  
  async initialize() {
    const initButton = document.getElementById('init-button');
    const statusDiv = document.getElementById('status');
    const themeToggle = document.getElementById('toggle-theme');
    
    // Adicionar evento de clique ao botão de inicialização
    initButton.addEventListener('click', async () => {
      statusDiv.innerText = "Inicializando...";
      statusDiv.className = "status-info";
      
      try {
        const success = await this.manager.initialize();
        
        if (success) {
          this.initialized = true;
          statusDiv.innerText = "Sistema inicializado com sucesso!";
          statusDiv.className = "status-success";
          this.updateUI();
          
          // Iniciar atualização periódica da UI
          setInterval(() => this.updateUI(), 15000);
        } else {
          statusDiv.innerText = "Falha na inicialização. Verifique o console para detalhes.";
          statusDiv.className = "status-error";
        }
      } catch (error) {
        statusDiv.innerText = `Erro: ${error.message}`;
        statusDiv.className = "status-error";
        console.error(error);
      }
    });
    
    // Adicionar evento de clique ao botão de alternar tema
    themeToggle.addEventListener('click', () => {
      this.darkMode = !this.darkMode;
      document.body.classList.toggle('dark-mode', this.darkMode);
    });
  }
  
  updateUI() {
    if (!this.initialized) return;
    
    const allocationsDiv = document.getElementById('allocations');
    const apysDiv = document.getElementById('apys');
    
    // Atualizar alocações com barras de progresso
    let allocationsHTML = `<h3>Alocações Atuais:</h3><ul>`;
    
    for (const [platform, allocation] of Object.entries(this.manager.currentAllocations)) {
      allocationsHTML += `
        <li class="allocation-item">
          <div>
            <span class="allocation-name">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            <span class="tooltip">ⓘ
              <span class="tooltip-text">Alocação atual em ${platform}</span>
            </span>
          </div>
          <span class="allocation-value">${(allocation * 100).toFixed(2)}%</span>
          <div class="progress-bar">
            <div class="progress-bar-fill progress-${platform}" style="width: ${allocation * 100}%"></div>
          </div>
        </li>
      `;
    }
    
    allocationsHTML += `</ul>`;
    allocationsDiv.innerHTML = allocationsHTML;
    
    // Atualizar APYs
    let apysHTML = `<h3>APYs Atuais:</h3><ul>`;
    
    for (const [platform, apy] of Object.entries(this.manager.platformAPYs)) {
      const apyClass = apy >= 0.05 ? "apy-value" : "apy-value apy-negative";
      apysHTML += `
        <li class="allocation-item">
          <div>
            <span class="allocation-name">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            <span class="tooltip">ⓘ
              <span class="tooltip-text">Rendimento anual percentual atual em ${platform}</span>
            </span>
          </div>
          <span class="${apyClass}">${(apy * 100).toFixed(2)}%</span>
        </li>
      `;
    }
    
    apysHTML += `</ul>`;
    apysDiv.innerHTML = apysHTML;
  }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se as bibliotecas necessárias estão disponíveis
  if (!window.solanaWeb3js && !window.solana) {
    console.error("Biblioteca Solana Web3.js não encontrada");
    document.getElementById('status').innerText = "Erro: Biblioteca Solana Web3.js não encontrada";
    document.getElementById('status').className = "status-error";
    return;
  }
  
  if (!window.axios) {
    console.error("Biblioteca axios não encontrada");
    document.getElementById('status').innerText = "Erro: Biblioteca axios não encontrada";
    document.getElementById('status').className = "status-error";
    return;
  }
  
  const app = new LiquidityPoolUI();
  app.initialize();
});