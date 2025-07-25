# Metodologia

A construção do TACO seguiu uma metodologia baseada em SCRUM e KANBAN, usando as cerimonias do SCRUM e quadro de atividades KANBAN. O desenvolvimento ocorreu de forma iterativa, com ciclos de planejamento, implementação e validação . A ideia inicial partiu da experiência prática de onboarding de colaboradores na área de TI. Mapas mentais e documentos extensos mostraram-se confusos, levando à concepção de um aplicativo leve e de fácil compreensão. Cada etapa foi guiada por requisitos levantados com potenciais usuários e validada em testes práticos. A seguir descreve-se o processo de desenvolvimento.

## Levantamento de Requisitos

Em reuniões com equipes interessadas no uso da ferramenta, foram mapeadas as necessidades de acompanhamento de tarefas e registro de dados. Identificou-se a demanda por um editor flexível de fluxos, suporte a perguntas personalizadas e geração de métricas de uso. Esses requisitos serviram de base para priorizar funcionalidades a serem implementadas.

## Prototipação Rápida com IA

Com os requisitos iniciais definidos, elaboraram-se protótipos em alta fidelidade para validar a estrutura de navegação e os componentes visuais. Em seguida, protótipos de alta fidelidade gerados no UX Pilot(mais tarde exportados para figma) permitiram testar a experiência do usuário antes da codificação. Ajustes de usabilidade foram realizados de forma colaborativa com os futuros usuários.

## Desenvolvimento Incremental

O código foi organizado em módulos independentes, possibilitando a evolução do projeto sem impactar a estabilidade das funções já prontas. Cada funcionalidade era submetida a revisões de código e testes unitários, garantindo consistência. O uso do Git possibilitou controle de versões e registro do histórico de decisões.
Durante o desenvolvimento, foram utilizados a ferramenta Codex e o chatGPT da Open IA e a ferramenta v0 da Vercel.
Codex é uma ferramenta que faz uma análise de todo o código, recebe uma orientação do que deve fazer(como uma task do kanban) e cria uma PR com o ajuste solicitado sem auxilio do desenvolvedor, de forma paralela pode fazer multiplas atividades. Cabe ao desenvolvedor analisar se o ajuste resolve a task de forma efetiva ou não. Aproveitando que o codex fazia atividades de forma paralela, usei codex para fazer ajustes em multiplas telas de forma paralela para evitar ter que resolver conflitos nas PRs mais tarde.
Enquanto Codex é uma ferramenta excelente para criar funcionalidades novas com visual simples e fazer ajustes pontuais. O v0 é uma ferramenta que gera o frontend mais polido, então usei codex para gerar funcionalidades e o v0 para refinar o visual do sistema.
Essa abordagem me permitiu fazer um sistema mais robusto, com visual polido e muitas funcionalidades.

### Evolução das Funcionalidades

Inicialmente o fluxo consistia em dois tipos básicos de etapas: texto para instruções rápidas e pergunta para ramificar o caminho conforme a resposta do usuário. Com o avanço dos testes surgiram necessidades de incorporar vídeos do YouTube, imagens e componentes totalmente personalizados em HTML, CSS e JavaScript. Essa flexibilidade permitiu elaborar passos mais ricos e solucionar dúvidas recorrentes. Sempre que um caso não estava previsto no fluxo, registrava-se a observação do usuário e o conteúdo era atualizado, mantendo a documentação viva.

## Validação e Testes

Durante o período de desenvolvimento, versões preliminares foram entregues para grupos restritos, que executaram fluxos reais e apontaram melhorias.
