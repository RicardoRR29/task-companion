# Arquitetura e Desenvolvimento

Esta seção descreve as principais escolhas de implementação e como o projeto foi estruturado para atender aos requisitos levantados.

## Visão Geral do Projeto

O TACO é uma aplicação *single page* construída com React e TypeScript. A organização das pastas separa componentes de apresentação, páginas de navegação e utilidades de persistência. O Vite é usado como *bundler* e servidor de desenvolvimento, oferecendo recarregamento rápido das telas.

## Editor de Fluxos e Tipos de Passo

O coração da aplicação é o editor de fluxos, que permite criar etapas de texto, perguntas condicionais, mídias e componentes personalizados. Cada passo possui campos de configuração e pode ser rearranjado por *drag and drop*. Essa flexibilidade facilita a adaptação de rotinas de diferentes setores.

## Armazenamento e Sincronização de Dados

Todas as informações são salvas localmente no IndexedDB por meio da biblioteca Dexie. Quando a aplicação volta a ter acesso à internet, é possível exportar ou importar fluxos em formato JSON, promovendo a troca de conteúdo entre usuários. Registros de execuções também podem ser baixados para auditoria.

## Registro de Execuções e Métricas

O módulo chamado "Flow Player" registra cada passagem do usuário pelo fluxo, contabilizando tempo gasto por etapa e respostas a perguntas. Esses dados alimentam relatórios com gráficos de acesso e taxa de conclusão, permitindo identificar pontos de melhoria.

## Personalização e Identidade Visual

Empresas podem definir cores, logotipo e componentes adicionais, garantindo que o TACO se integre à identidade de cada organização. A arquitetura modular facilita a inclusão de novos tipos de passo e a customização do layout.
