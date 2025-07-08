# Metodologia

A construção do TACO seguiu uma metodologia iterativa, com ciclos de planejamento, implementação e validação. A ideia inicial partiu da experiência prática de onboarding de colaboradores na área de TI. Mapas mentais e documentos extensos mostraram-se confusos, levando à concepção de um aplicativo leve e de fácil compreensão. Cada etapa foi guiada por requisitos levantados com potenciais usuários e validada em testes práticos. A seguir descreve-se o processo de desenvolvimento.

## Levantamento de Requisitos

Em reuniões com equipes interessadas no uso da ferramenta, foram mapeadas as necessidades de acompanhamento de tarefas e registro de dados. Identificou-se a demanda por um editor flexível de fluxos, suporte a perguntas personalizadas e geração de métricas de uso. Esses requisitos serviram de base para priorizar funcionalidades a serem implementadas.

## Prototipação Rápida

Com os requisitos iniciais definidos, elaboraram-se protótipos em baixa fidelidade para validar a estrutura de navegação e os componentes visuais. Em seguida, protótipos de alta fidelidade feitos em Figma permitiram testar a experiência do usuário antes da codificação. Ajustes de usabilidade foram realizados de forma colaborativa com os futuros usuários.

## Desenvolvimento Incremental

O código foi organizado em módulos independentes, possibilitando a evolução do projeto sem impactar a estabilidade das funções já prontas. Cada funcionalidade era submetida a revisões de código e testes unitários, garantindo consistência. O uso do Git possibilitou controle de versões e registro do histórico de decisões.

### Evolução das Funcionalidades

Inicialmente o fluxo consistia em dois tipos básicos de etapas: texto para instruções rápidas e pergunta para ramificar o caminho conforme a resposta do usuário. Com o avanço dos testes surgiram necessidades de incorporar vídeos do YouTube, imagens e componentes totalmente personalizados em HTML, CSS e JavaScript. Essa flexibilidade permitiu elaborar passos mais ricos e solucionar dúvidas recorrentes. Sempre que um caso não estava previsto no fluxo, registrava-se a observação do usuário e o conteúdo era atualizado, mantendo a documentação viva.

## Validação e Testes

Durante o período de desenvolvimento, versões preliminares foram entregues para grupos restritos, que executaram fluxos reais e apontaram melhorias. Além de testes manuais, foram criados roteiros automatizados com a biblioteca Playwright para verificar a integridade das principais rotas e interações. Os relatos de uso serviram para otimizar a performance do aplicativo e aprimorar as mensagens de erro.

## Iterações Pós-Lançamento

A segunda versão teve como foco aprimorar a usabilidade e ampliar as métricas disponíveis. Com feedback contínuo dos primeiros usuários, implementamos gráficos detalhados, página dedicada a auditoria e registro de ações. A interface do editor também ganhou drag and drop mais refinado e suporte completo a importação e exportação de fluxos em JSON.

A metodologia manteve ciclos curtos de releases, permitindo validar cada melhoria rapidamente. Os testes automatizados com Playwright foram expandidos para cobrir cenários de uso no mobile, garantindo que a experiência PWA se mantivesse consistente.
