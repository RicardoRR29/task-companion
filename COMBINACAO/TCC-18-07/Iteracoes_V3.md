# Iterações da Versão 3

O TACO (Task Companion) alcançou sua terceira versão incorporando melhorias sugeridas nas fases anteriores. O objetivo permaneceu o mesmo: facilitar o registro e a execução de procedimentos por meio de fluxos interativos executados no navegador, mesmo em modo offline.

## Resumo da Metodologia

A evolução do projeto seguiu uma abordagem iterativa. Requisitos foram coletados em reuniões e implementados em ciclos curtos, contando com o auxílio de ferramentas como Codex e ChatGPT 4.0 para realizar tarefas assíncronas. Para mitigar conflitos de _pull requests_, as modificações ficaram segmentadas por telas. Nesta fase, não houve testes com usuários reais, logo os resultados de usabilidade ainda são hipotéticos.

## Funcionalidades Incluídas

- Editor de passos capaz de lidar com texto, perguntas, mídias ou componentes customizados.
- Registro local de cada etapa executada, gerando métricas como tempo médio por passo e taxa de conclusão.
- Exportação de fluxos em JSON para compartilhamento entre instalações.
- Modo offline, permitindo o uso da ferramenta em locais sem conectividade.

## Tecnologias Adicionais

- **Playwright** para testes automatizados de rotas.
- **OpenAI Codex** e **ChatGPT 4.0** no apoio à geração de código e refatoração.
- **v0** para criação de protótipos iniciais.

## Considerações Finais

Embora ainda falte validação com usuários, a versão 3 demonstra que a abordagem local do TACO é viável. Futuramente, pretende-se explorar integrações em nuvem e testes de usabilidade para ampliar o alcance da solução.
