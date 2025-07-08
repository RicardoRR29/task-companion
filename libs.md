# Bibliotecas Utilizadas

Este documento descreve, de forma resumida, a finalidade de cada biblioteca presente no arquivo `package.json` do projeto **TACO (Task Companion)**.

## Dependências de Produção

- **@dnd-kit/core**, **@dnd-kit/modifiers**, **@dnd-kit/sortable** – Conjunto de bibliotecas para implementar "drag and drop" em React, usado no editor de passos para reordenar etapas.
- **@radix-ui/react-<component>** – Coleção de componentes acessíveis (dialog, dropdown, tabs, etc.) que compõe a interface do aplicativo.
- **class-variance-authority** e **clsx** – Utilitários para montar classes CSS condicionais de maneira organizada.
- **dexie** – Camada de abstração para IndexedDB; armazena fluxos, sessões e logs localmente, permitindo funcionamento offline.
- **lucide-react** – Conjunto de ícones em React empregado em diversos botões e menus.
- **pouchdb-browser** – Alternativa para sincronização/backup em nuvem; atualmente usada para estudo de replicação futura.
- **react** e **react-dom** – Biblioteca principal para criar a interface e renderizar componentes.
- **react-markdown** – Faz o parse de texto Markdown para elementos React, possibilitando exibir conteúdos formatados.
- **react-router-dom** – Gerencia rotas da aplicação SPA, controlando páginas e navegação.
- **react-syntax-highlighter** – Destaca trechos de código nos passos ou exemplos exibidos ao usuário.
- **recharts** – Biblioteca de gráficos utilizada nas páginas de analytics para exibir métricas e relatórios.
- **tailwind-merge** e **tailwindcss-animate** – Complementos ao Tailwind CSS para combinar classes utilitárias e adicionar animações.
- **vite-plugin-pwa** – Responsável por gerar o service worker e manifestos, tornando a aplicação uma PWA.
- **zustand** – Biblioteca enxuta de gerenciamento de estado para armazenar configurações e listas de fluxos.
- **undefined** – Dependência não utilizada; possivelmente incluída por engano.

## Dependências de Desenvolvimento

- **@eslint/js** e **eslint** – Conjunto principal do ESLint para análise estática do código.
- **@tailwindcss/typography** – Plugin do Tailwind para estilização de conteúdos ricos em texto.
- **@testing-library/react** – Fornece utilidades para testes de componentes React.
- **@types/<library>** – Definições de tipos para integração com TypeScript.
- **@vitejs/plugin-react** – Integração do Vite com o React e suporte a Fast Refresh.
- **autoprefixer** e **postcss** – Tratamento de CSS para garantir compatibilidade entre navegadores.
- **eslint-plugin-react-hooks** e **eslint-plugin-react-refresh** – Regras extras de lint para hooks e hot reload.
- **globals** – Lista de variáveis globais reconhecidas pelo ESLint.
- **playwright** – Ferramenta de testes de ponta a ponta utilizada para validar rotas e interações principais.
- **tailwindcss** – Framework utilitário de CSS que compõe todo o design da aplicação.
- **typescript** e **typescript-eslint** – Suporte à linguagem TypeScript e suas regras de lint.
- **vite** – Bundler e servidor de desenvolvimento rápido utilizado para compilar o projeto.
- **vitest** – Test runner para testes unitários (integração prevista, mas ainda pouco utilizada).

