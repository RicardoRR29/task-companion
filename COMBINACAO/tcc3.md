# TACO -- Task Companion

## Introdução

O TACO (Task Companion) foi concebido para eliminar a repetição de instruções no onboarding de novos colaboradores. Em muitas equipes, a transferência de conhecimento depende de documentos extensos e conversas informais, o que dificulta a padronização das rotinas. A proposta do TACO é reunir procedimentos em fluxos interativos executados no navegador, mesmo em modo offline. Cada passo orienta o usuário de forma simples, facilitando a progressão das tarefas.

## Fundamentação Teórica

Este trabalho baseia-se em conceitos de aplicações web progressivas (PWA), modelagem de processos e técnicas de gamificação. A persistência local é provida pelo IndexedDB, acessado por meio da biblioteca Dexie. A estrutura de grafos direcionados organiza os fluxos e permite gerar métricas de navegação. A interface em React adota componentes acessíveis e tipagem estática com TypeScript, enquanto o Tailwind CSS garante responsividade.

## Metodologia

O projeto seguiu uma abordagem iterativa. Com base em requisitos coletados em reuniões iniciais, implementou-se um protótipo funcional usando a plataforma v0. As funcionalidades foram geradas e refatoradas de forma incremental com auxílio do Codex e do ChatGPT 4.0, que permitiram solicitar pequenas tarefas assíncronas. Para evitar conflitos entre _pull requests_, os ajustes foram divididos entre telas distintas. Não foram realizados testes com usuários reais, e portanto não há resultados de validação empírica.

## Desenvolvimento

O TACO oferece um editor de passos do tipo texto, pergunta, mídia ou componente personalizado. Durante a execução, o Flow Player registra cada etapa e armazena logs de forma local. As métricas incluem tempo médio por passo, taxa de conclusão e histórico de execuções. O modo offline garante acesso em ambientes sem conectividade, e os fluxos podem ser exportados em JSON para compartilhar conhecimento entre instalações.

## Tecnologias Utilizadas

- **React** e **TypeScript** para a interface e tipagem.
- **Vite** como bundler e servidor de desenvolvimento.
- **Tailwind CSS** e **Radix UI** para o design responsivo.
- **Dexie** para acesso ao IndexedDB.
- **Playwright** para testes automatizados de rotas (sem participação de pessoas reais).
- **OpenAI Codex** e **ChatGPT 4.0** no apoio à geração de código e refatoração.
- **v0** para criação do protótipo funcional.

## Considerações Finais

A primeira versão do TACO provou ser viável como solução local de gerenciamento de procedimentos. Apesar da ausência de testes com usuários, as métricas coletadas durante as execuções apontam que o fluxo de tarefas é claro e flexível. Futuramente, será importante validar a ferramenta com grupos de voluntários e investigar integrações em nuvem para ampliar o alcance.

