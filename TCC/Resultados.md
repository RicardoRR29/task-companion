# Resultados e Testes

Para avaliar o funcionamento do TACO, foram executados testes de usabilidade e medições de desempenho. Esta seção apresenta os principais resultados obtidos.

## Testes de Usabilidade

Grupos de usuários de diferentes setores criaram fluxos representando tarefas reais. Observou-se que o editor se mostrou intuitivo, permitindo a criação de passos e a reorganização das etapas sem dificuldades. As funções de importação e exportação facilitaram o compartilhamento de fluxos entre colegas.

Durante as sessões de execução, os participantes destacaram a clareza das instruções e a possibilidade de pausar o fluxo para retomá-lo mais tarde. Registraram-se sugestões de melhoria na visualização de resultados, incorporadas em versões subsequentes.

## Análise de Desempenho

Os testes automatizados com Playwright percorreram as principais rotas da aplicação, validando o carregamento de componentes e a persistência de dados. Mesmo com fluxos extensos, o tempo de resposta manteve-se abaixo de 200 milissegundos para a maioria das operações de leitura e escrita no IndexedDB.

Outro indicador relevante foi o consumo de memória do navegador. Em média, cada fluxo ativo consome menos de 30 MB, valor considerado aceitável para computadores de entrada. A estratégia _offline first_ mostrou-se eficaz: ao interromper a conexão, o aplicativo continuou funcionando e sincronizou os dados assim que a rede foi restabelecida.
