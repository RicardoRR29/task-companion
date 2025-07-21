# Funcionalidades do Projeto

Este documento descreve de forma detalhada a estrutura existente em `src` e como cada pasta contribui para o funcionamento da aplicação.

## Visão Geral

A aplicação permite criar **fluxos** interativos compostos por passos. Cada fluxo pode ser executado pelo usuário (player), analisado por meio de gráficos e tem todas as ações registradas em um log de auditoria. Os dados são mantidos localmente em um banco **Dexie**.

## Estrutura de Pastas

- **`assets/`** – Contém arquivos estáticos utilizados pela interface.
- **`components/`** – Componentes reutilizáveis de UI e blocos específicos de páginas.
- **`db/`** – Configuração do banco Dexie e definição das tabelas.
- **`hooks/`** – Conjunto de hooks que encapsulam o estado global e lógicas da aplicação.
- **`pages/`** – Todas as telas visíveis para o usuário, organizadas por funcionalidade.
- **`types/`** – Interfaces TypeScript compartilhadas entre componentes.
- **`utils/`** – Funções auxiliares diversas.

A raiz também possui `index.css`, `main.tsx` e `vite-env.d.ts` como ponto de entrada e estilos globais.

## Detalhamento das Funcionalidades

### Fluxos (`hooks/useFlows.ts` e páginas `Dashboard`/`FlowEditor`)

- **Criação/edição**: os fluxos são mantidos em `db.flows` e manipulados pelo hook `useFlows`. O editor (`pages/FlowEditor`) permite adicionar, ordenar e configurar passos através do componente `StepForm`.
- **Clone, importação e exportação**: o mesmo hook oferece métodos para clonar um fluxo existente, exportar para JSON e importar arquivos externos.
- **Dashboard**: listado em `pages/Dashboard`, mostra todos os fluxos com filtros, busca e opções de duplicar, editar, executar ou remover.

### Execução (`pages/FlowPlayer` e `hooks/usePlayer.ts`)

- **Player**: executa os passos sequencialmente. O hook `usePlayer` controla o progresso, registra a sessão no banco e permite navegação avançada (voltar, escolher opções de pergunta ou reiniciar).
- **Componentes de player**: `Header`, `StepCard` e `CompletionScreen` compõem a interface durante a execução do fluxo.

### Analytics (`pages/Analytics` e `hooks/useAnalytics.ts`)

- **Métricas**: o hook `useAnalytics` calcula visitas, conclusões e tempo gasto em cada passo a partir de `sessions` e `stepEvents` no banco.
- **Gráficos**: em `pages/Analytics` há componentes como `TimelineChart`, `Heatmap`, `StackedAreaChart` e `TotalTimeChart` que utilizam esses dados para exibir relatórios detalhados.

### Componentes Personalizados (`pages/CustomComponents` e `hooks/useCustomComponents.ts`)

- Permite criar componentes HTML/JS/CSS que podem ser inseridos em passos de um fluxo (tipo `CUSTOM`). Os dados ficam em `db.customComponents`.
- A página lista, edita e remove componentes, garantindo sanitização do código antes de salvar.

### Configurações da Empresa (`pages/Company` e `hooks/useCompanySettings.ts`)

- Armazena logo e cores principais no `localStorage`. Tais cores são aplicadas ao tema pela função `applyBrandColors` em `utils/theme.ts`.

### Auditoria (`pages/AuditTrail` e `utils/audit.ts`)

- Todas as ações relevantes (criação de fluxo, execução, erros) são registradas em `db.logs` via `logAction`.
- A página `AuditTrail` exibe esses registros com filtros e busca, permitindo acompanhar o histórico de uso.

### Backup e Restauração (`pages/Settings` e `utils/backup.ts`)

- A funcionalidade gera um arquivo JSON contendo todo o banco e entradas de `localStorage` (`createBackup`).
- É possível restaurar os dados importando o arquivo via `restoreBackup`, reiniciando a aplicação.

### Outras Utilidades

- **`utils/graph.ts`** – Gera conexões e layouts para visualização da estrutura dos passos.
- **`utils/markdown.ts`** – Converte texto markdown em HTML para exibição em passo ou componentes.
- **`hooks/use-toast.ts`** – Sistema de notificações (toasts) utilizado em diversas páginas.

Este resumo complementa o arquivo [`arquivos.md`](./arquivos.md) e ajuda a entender como cada parte da pasta `src` se relaciona para entregar as principais funcionalidades do projeto.

