# Desenvolvimento

Esta seção detalha as principais etapas da implementação do TACO, destacando as escolhas tecnológicas e as soluções adotadas para atender aos requisitos do projeto.

## Arquitetura do Sistema

O TACO foi desenvolvido como uma aplicação _single page_ baseada em React. Os fluxos e eventos são armazenados localmente utilizando Dexie, enquanto a navegação é controlada pelo React Router. A estrutura de pastas separa componentes de apresentação, páginas, utilitários e definições de banco de dados, favorecendo a organização e a manutenibilidade.

O Vite desempenha o papel de _bundler_ e servidor de desenvolvimento, proporcionando recarregamento rápido e suporte a TypeScript. Para estilização, emprega-se Tailwind CSS, complementado pela biblioteca Radix UI para componentes acessíveis. Essa combinação garante código enxuto e experiencia consistente entre navegadores.

## Editor de Fluxos

O editor permite criar e modificar fluxos compostos por passos do tipo texto, pergunta, mídia ou personalizado. Cada passo possui configuração de conteúdo e de transições para outros passos. A interface utiliza _drag and drop_ por meio da biblioteca **@dnd-kit**, facilitando o reordenamento das etapas. Para evitar conflitos entre fluxos, cada passo recebe um identificador único gerado no ato da criação.

## Execução e Coleta de Dados

Quando um fluxo é iniciado, o "Flow Player" registra a passagem do usuário por cada passo, armazenando eventos em coleções específicas no IndexedDB. Caso a execução seja concluída, incrementa-se o contador de finalizações e grava-se um log de resumo. Informações como tempo gasto por etapa e respostas a perguntas ficam disponíveis para análise posterior.

O sistema exporta os fluxos em formato JSON, possibilitando o compartilhamento entre diferentes instalações. Da mesma forma, logs de execução podem ser baixados para auditorias ou importados por outras ferramentas. O uso de _webhooks_ permite integrar a conclusão de etapas a APIs externas, enviando dados em tempo real.
