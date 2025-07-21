# Estrutura de arquivos da pasta `src`

Este documento descreve todos os arquivos contidos dentro da pasta `src` do projeto, agrupados por diretórios. Cada item tem um resumo sobre sua funcionalidade.

## Diretórios

- `assets/` – Arquivos estáticos utilizados pela aplicação.
- `components/` – Componentes React reutilizáveis, subdivididos em `dashboard/`, `flow/` e `ui/`.
- `db/` – Configuração do banco de dados local (Dexie).
- `hooks/` – Hooks personalizados de estado e utilidades.
- `pages/` – Páginas principais da aplicação e suas subpastas.
- `types/` – Definições TypeScript compartilhadas.
- `utils/` – Funções utilitárias gerais.

Além destas pastas, a raiz de `src` contém arquivos de configuração e ponto de entrada da aplicação.

## Arquivos

### Raiz de `src`

- `index.css` – Estilos globais e tokens de cores. Utiliza Tailwind.
- `main.tsx` – Ponto de entrada da aplicação React; registra o service worker e define as rotas.
- `vite-env.d.ts` – Declarações para o Vite/PWA.

### `assets`

- `react.svg` – Ícone utilizado na interface.

### `components`

- `CustomRenderer.tsx` – Renderiza HTML, CSS e JS personalizados em um `iframe` de forma segura.
- `Markdown.tsx` – Componente simples que converte markdown em HTML usando `parseMarkdown`.
- `Sidebar.tsx` – Layout com barra lateral de navegação.

#### `components/dashboard`

- `AIFlowModal.tsx` – Modal para criação de fluxos usando IA.
- `DashboardSkeleton.tsx` – Esqueleto de carregamento da página inicial.
- `EmptySearchState.tsx` – Mensagem exibida quando não há resultados na busca.
- `EmptyState.tsx` – Mensagem exibida quando não existem fluxos cadastrados.
- `FlowCard.tsx` – Cartão que exibe informações resumidas de um fluxo com ações disponíveis.
- `ProgressCard.tsx` – Cartão que mostra progresso de sessões em execução.

#### `components/flow`

- `StepForm.tsx` – Formulário reutilizado em várias telas para edição de passos.

#### `components/ui`

Componentes de interface baseados em Radix e Tailwind:

- `alert-dialog.tsx` – Diálogo de confirmação.
- `alert.tsx` – Componente de alerta simples.
- `avatar.tsx` – Avatar de usuário.
- `badge-variants.ts` – Variantes de estilos para o componente `Badge`.
- `badge.tsx` – Componente de selo/etiqueta.
- `button-variants.ts` – Variantes de estilos para `Button`.
- `button.tsx` – Botão padrão.
- `card.tsx` – Estrutura de cartão.
- `dialog.tsx` – Diálogo genérico.
- `dropdown-menu.tsx` – Menu suspenso.
- `input.tsx` – Campo de texto padrão.
- `label.tsx` – Rótulo para formulários.
- `progress.tsx` – Barra de progresso.
- `scroll-area.tsx` – Área com rolagem customizada.
- `select.tsx` – Componente de seleção.
- `separator.tsx` – Separador horizontal/vertical.
- `sheet.tsx` – Painel deslizante (sheet).
- `skeleton.tsx` – Placeholder de carregamento.
- `switch.tsx` – Botão de alternância.
- `table.tsx` – Tabela de dados.
- `tabs.tsx` – Guia de abas.
- `textarea.tsx` – Área de texto multilinha.
- `toast.tsx` – Componente de toast/aviso.
- `toaster.tsx` – Container para exibir múltiplos toasts.

### `db`

- `index.ts` – Inicializa o banco Dexie e define tabelas (`flows`, `sessions`, `logs`, etc.).

### `hooks`

- `use-is-mobile.ts` – Detecta largura da janela para saber se é visualização mobile.
- `use-toast.ts` – Implementação de sistema de toast inspirado no `react-hot-toast`.
- `useAnalytics.ts` – Calcula métricas agregadas de um fluxo baseado em sessões.
- `useAnalyticsConfig.ts` – Armazena preferências de exibição de métricas usando `zustand`.
- `useCompanySettings.ts` – Gerencia logo e cores da empresa persistidos em localStorage.
- `useCustomComponents.ts` – CRUD de componentes HTML personalizados salvos no banco.
- `useFlows.ts` – Estado principal de todos os fluxos, com funções para criar, clonar, importar e exportar.
- `usePlayer.ts` – Controla a execução de um fluxo passo a passo e registra sessões.

### `pages`

Arquivos de páginas que compõem o aplicativo.

- `Audit.tsx` – Página que encapsula `AuditTrail` dentro do layout.
- `Company.tsx` – Formulário para alterar logo e cores da empresa.
- `CustomComponents.tsx` – CRUD visual de componentes personalizados.
- `FlowImportExport.tsx` – Tela reutilizável para exportar ou importar fluxos via JSON.
- `ImportExport.tsx` – Página geral de importação e exportação.
- `Settings.tsx` – Página de backup e restauração do banco local.
- `AuditTrail.tsx` – Lista de logs de ações registradas (com filtros e busca).
- `FlowEditor.tsx` – Wrapper para o editor visual completo de fluxos.
- `PathAnalytics.tsx` – Página de análise de caminhos percorridos (heatmap).

#### `pages/Analytics`

- `AnalyticsHeader.tsx` – Cabeçalho da página de analytics com informações resumidas.
- `EnhancedAnalytics.tsx` – Versão aprimorada da tela de analytics, juntando diversos gráficos.
- `EnhancedHeadmap.tsx` – Heatmap de passos usando dados mais detalhados.
- `Heatmap.tsx` – Componente de heatmap simples.
- `PerformanceInsights.tsx` – Painel que destaca o passo mais lento e outras métricas.
- `ReportSummary.tsx` – Cartões resumidos de visitas, conclusões e taxa de conclusão.
- `StackedAreaChart.tsx` – Gráfico de área por passo ao longo do tempo.
- `TimelineChart.tsx` – Linha do tempo de tempo gasto em cada passo por sessão.
- `TotalTimeChart.tsx` – Gráfico de barras do tempo total em cada passo.
- `index.tsx` – Página principal de analytics que orquestra todos os gráficos anteriores.

#### `pages/Dashboard`

- `EmptySearchState.tsx` – Mensagem quando nenhuma busca retorna resultados.
- `EmptyState.tsx` – Mensagem quando não existem fluxos cadastrados.
- `FlowCard.tsx` – Cartão listando um fluxo e suas ações.
- `Skeleton.tsx` – Esqueleto de carregamento da página.
- `index.tsx` – Lista de fluxos com filtros, busca e ordenação.

#### `pages/FlowEditor`

- `index.tsx` – Editor visual de passos de um fluxo com arraste e formulários.
- `EmptyState.tsx` – Mensagem mostrada quando o fluxo ainda não possui passos.
- `Skeleton.tsx` – Esqueleto de carregamento do editor.
- `StepItem.tsx` – Item da lista de passos utilizado na sidebar do editor.
- `StepsSidebar.tsx` – Barra lateral com ordenação por arraste de passos.

##### `pages/FlowEditor/StepForm`

Formulários específicos para cada tipo de passo:

- `Custom.tsx` – Formulário para passo com componente customizado.
- `Media.tsx` – Formulário de passo que exibe imagem ou vídeo do YouTube.
- `Question.tsx` – Formulário para passo de pergunta com opções arrastáveis.
- `Text.tsx` – Formulário para passo de texto simples.
- `index.tsx` – Componente principal que decide qual formulário de passo renderizar e possui modo de visualização.

#### `pages/FlowPlayer`

- `CompletionScreen.tsx` – Tela final exibida ao concluir um fluxo.
- `Header.tsx` – Cabeçalho do player com barra de progresso e botão de sair.
- `Skeleton.tsx` – Placeholder enquanto o fluxo é carregado.
- `StepCard.tsx` – Renderiza um passo durante a execução (texto, pergunta, mídia etc.).
- `index.tsx` – Player que executa os passos do fluxo e controla a navegação.

### Demais páginas

- `Dashboard/index.tsx` (descrita acima) e `FlowEditor.tsx` (wrapper) já mencionados.
- `FlowImportExport.tsx` (explicado acima) é utilizado também por `ImportExport.tsx` para operações gerais.
- `PathAnalytics.tsx` – Página que mostra métricas de caminhos percorridos.

### `types`

- `flow.ts` – Define todas as interfaces relacionadas a fluxos, passos, sessões e logs, além do formato de exportação `FlowPackage`.
- `pwa.d.ts` – Tipagens mínimas para o plugin PWA utilizado pelo Vite.
- `settings.ts` – Interface das preferências do dashboard (modo de visualização e colunas exibidas).

### `utils`

- `audit.ts` – Funções para registrar e recuperar logs de ações no banco.
- `backup.ts` – Gera backup completo do banco e restaura a partir de um arquivo.
- `cn.ts` – Concatenador simples de classes CSS.
- `graph.ts` – Constrói grafos e layouts de passos para visualizações.
- `markdown.ts` – Parser básico de Markdown para HTML.
- `theme.ts` – Conversão de cores hexadecimal para HSL e aplicação das cores da empresa.
- `youtube.ts` – Gera a URL de embed do YouTube a partir de links diversos.

