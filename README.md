# Gerenciador Automático de Pools de Liquidez Solana

Um aplicativo web para gerenciar automaticamente alocações de liquidez em diferentes protocolos DeFi no ecossistema Solana.

![Gerenciador de Pools](https://example.com/screenshot.png)

## Visão Geral

Este aplicativo permite gerenciar automaticamente a alocação de ativos entre diferentes protocolos de liquidez no ecossistema Solana (Meteora, Orca e Raydium), rebalanceando fundos baseado nas taxas de APY para maximizar rendimentos.

## Características

- **Conexão com Carteira Phantom**: Integração direta com a carteira Phantom para operações na blockchain Solana
- **Monitoramento de APY**: Verifica rendimentos em tempo real das plataformas
- **Rebalanceamento Automático**: Redistribui fundos automaticamente para plataformas com melhores rendimentos
- **Interface Visual com Barras de Progresso**: Visualização clara das alocações atuais
- **Modo Escuro**: Suporte a alternância entre tema claro e escuro
- **Interface Responsiva**: Funciona bem em dispositivos móveis e desktop

## Plataformas Suportadas

- **Meteora**: Protocolo AMM nativo de Solana
- **Orca**: Exchange descentralizada (DEX) no ecossistema Solana
- **Raydium**: Provedor de liquidez automatizada e market maker na rede Solana

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Extensão da carteira Phantom instalada
- Conta Solana com fundos

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/gerenciador-liquidez-solana.git
cd gerenciador-liquidez-solana
```

2. Abra o arquivo `index.html` em seu navegador ou use um servidor web local:
```bash
# Usando Python para criar um servidor local
python -m http.server 8000
```

3. Acesse `http://localhost:8000` no seu navegador

## Uso

1. Abra o aplicativo no navegador
2. Clique em "Inicializar Sistema"
3. Aprove a conexão na extensão Phantom quando solicitado
4. O sistema começará automaticamente a monitorar e otimizar suas alocações

## Configuração

É possível customizar os parâmetros do sistema editando o objeto `CONFIG` no arquivo `script.js`:

```javascript
const CONFIG = {
  allocations: {
    meteora: 0.33,    // 33% para Meteora (padrão)
    orca: 0.33,       // 33% para Orca (padrão)
    raydium: 0.34     // 34% para Raydium (padrão)
  },
  rebalanceThreshold: 0.05,  // Rebalancear quando o rendimento diferir em 5%
  refreshInterval: 3600000,  // Verificar rendimentos a cada hora (em ms)
  slippageTolerance: 0.005   // 0.5% de tolerância de slippage
};
```

## Segurança

- O aplicativo opera diretamente com sua carteira Phantom
- Todo o código é executado localmente no seu navegador
- Nenhum dado é enviado para servidores externos, exceto chamadas às APIs públicas para verificar APYs
- Revise o código antes de usar com fundos reais

## Estrutura do Projeto

- `index.html`: Estrutura da interface do usuário
- `styles.css`: Folha de estilos para a interface
- `script.js`: Lógica principal do aplicativo e gerenciamento de pools

## Limitações Atuais

- Suporta apenas protocolos na blockchain Solana
- A implementação atual usa valores estáticos de APY para demonstração
- Funcionalidades de configuração avançadas ainda não estão disponíveis na UI

## Desenvolvimento Futuro

- [ ] Implementar cálculo real de APY baseado em dados on-chain
- [ ] Adicionar suporte a mais protocolos no ecossistema Solana
- [ ] Implementar configurações personalizáveis na interface
- [ ] Adicionar histórico de rebalanceamentos
- [ ] Implementar notificações por email ou dispositivo móvel

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Disclaimer

Este software é fornecido "como está", sem garantias de qualquer tipo. Use por sua conta e risco. Sempre faça sua própria pesquisa antes de comprometer fundos reais em contratos DeFi.
