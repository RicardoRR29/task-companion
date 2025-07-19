# Introdução

Nesta seção de abertura, apresento-me à banca e dou as boas-vindas ao público presente. Ao longo dos últimos meses, concentrei meus esforços no desenvolvimento do **TACO (Task Companion)**, uma aplicação web voltada a padronizar treinamentos de forma simples e interativa. O objetivo desta defesa é explicar como a ferramenta foi concebida e quais resultados foram alcançados.

O problema que motivou o projeto surge em ambientes corporativos onde a transmissão de conhecimento depende de repetição constante de instruções. Manuais extensos, documentos dispersos e a falta de acompanhamento tornam o aprendizado moroso. Frequentemente não há clareza sobre o que cada novo colaborador já realizou, dificultando o avanço nas atividades.

O TACO propõe uma solução prática: transformar procedimentos em fluxos de passos que podem ser seguidos no navegador, mesmo sem conexão com a internet. Cada tarefa aparece em sequência, guiando o usuário até a conclusão e registrando todo o percurso. Dessa forma, elimina-se a dependência de conversas paralelas e reduz-se a curva de aprendizado.

Nesta apresentação abordarei os principais tópicos do trabalho: a motivação e justificativa do projeto, os fundamentos teóricos, a metodologia adotada, a arquitetura e o desenvolvimento da aplicação, os resultados obtidos e as perspectivas para o futuro. Ao final, abrirei espaço para perguntas e farei um breve encerramento.
# Motivação e Justificativa

A concepção do TACO nasceu de experiências profissionais em que treinamentos eram conduzidos de maneira informal, exigindo repetidas explicações a cada novo membro da equipe. Documentos estavam espalhados por diferentes pastas e formatos, dificultando a consulta rápida. Esse cenário criava uma curva de aprendizado longa e muitas vezes frustrante para os iniciantes.

Percebeu-se que faltava uma ferramenta centralizada que orientasse cada colaborador passo a passo, registrando sua evolução. Além disso, da forma que foi implementada, caso o usuário instale o site como aplicativo, a solução funciona sem depender de internet.
....

O TACO surge como resposta a esses desafios. Ao padronizar fluxos de tarefas em um aplicativo web livre e acessível, ele reduz a dependência de supervisão constante. A interface intuitiva permite que qualquer setor documente processos de forma rápida, economizando tempo de especialistas e promovendo a autonomia dos usuários.

Justifica-se, portanto, o desenvolvimento de uma plataforma que una simplicidade, portabilidade e modo offline. Assim, empresas e equipes de diversos segmentos podem acelerar o onboarding e garantir que o conhecimento esteja disponível sempre que necessário.
# Fundamentação Teórica

Para embasar o desenvolvimento do TACO, foram pesquisados conceitos que garantem uma experiência consistente no navegador e a possibilidade de uso sem internet. As tecnologias e metodologias a seguir formam o alicerce do projeto.

## Aplicações Web Progressivas (PWA)

As PWAs combinam características de aplicativos nativos com a flexibilidade da web. O uso de *service workers* permite armazenar recursos estáticos e disponibilizar o aplicativo mesmo em modo offline. Além disso, o manifesto da aplicação possibilita instalação em vários dispositivos, oferecendo uma aparência similar à de aplicativos tradicionais.

## Persistência Local com IndexedDB e Dexie

Para registrar fluxos, execuções e configurações, o TACO utiliza o IndexedDB, banco de dados presente nos navegadores modernos. A biblioteca Dexie simplifica as operações de leitura e escrita, garantindo performance e segurança. Dessa maneira, todos os dados ficam disponíveis localmente e podem ser sincronizados quando houver conexão.

## Modelagem por Grafos de Transição

Os procedimentos são representados por grafos direcionados, em que cada nó corresponde a um passo e as arestas determinam o próximo caminho. Essa estrutura facilita ramificações, perguntas condicionais e coleta de métricas de navegação, como tempo gasto e taxa de conclusão.

## Gamificação e Feedback Contínuo

O projeto adota elementos de gamificação para manter o usuário engajado: indicadores de progresso, recompensas visuais e mensagens de incentivo a cada etapa concluída. Além disso, o sistema registra comentários e sugestões, promovendo um ciclo de melhoria contínua.

## Interface Reativa em React e Tailwind CSS

A camada de apresentação é construída com React e estilizada com Tailwind CSS. Essa combinação favorece a criação de componentes reutilizáveis e responsivos. Bibliotecas como Radix UI garantem acessibilidade, enquanto o Zustand gerencia o estado global de forma simples e eficiente.
# Metodologia

O desenvolvimento do TACO seguiu uma abordagem iterativa. A cada ciclo foram avaliados requisitos, criados protótipos e realizadas validações. O objetivo foi evoluir a aplicação de maneira contínua, incorporando feedback de potenciais usuários.

## Levantamento de Requisitos

Inicialmente foram conduzidas reuniões com equipes que enfrentavam dificuldades em padronizar treinamentos. Nesses encontros mapeou-se a necessidade de registrar passos simples, permitir perguntas condicionais e gerar métricas de uso. Esses pontos serviram de base para priorizar funcionalidades.

## Prototipação Rápida e Testes de Usabilidade

Com os requisitos em mãos, desenvolvemos protótipos de baixa fidelidade para verificar a compreensão das telas. Em seguida, versões funcionais foram criadas e submetidas a pequenos grupos de teste. As observações levantadas ajudaram a ajustar tanto o design quanto o fluxo de interação.

## Desenvolvimento Incremental com Git

Cada novo recurso foi implementado em branches específicas, mantendo o repositório organizado. Essa prática permitiu documentar a evolução do projeto e facilitou o trabalho colaborativo. Revisões de código garantiram que padrões de qualidade fossem respeitados.

## Automação de Testes

A biblioteca Playwright foi empregada para simular rotas principais e interações no navegador. Embora o conjunto de testes ainda esteja em expansão, ele auxilia a prevenir regressões e comprova que as funcionalidades essenciais continuam operando após alterações.
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
# Resultados

Após diversas iterações, o TACO alcançou um conjunto estável de funcionalidades. Testes de usabilidade foram conduzidos com grupos internos que criaram fluxos representando tarefas reais. O editor se mostrou intuitivo, permitindo rearranjo de etapas e inclusão de mídias sem dificuldades.

O desempenho do aplicativo foi avaliado em navegadores modernos, apresentando baixo consumo de memória e respostas rápidas. Mesmo com grande quantidade de fluxos cadastrados, a navegação permaneceu fluida. Como todos os dados ficam armazenados localmente, o carregamento das telas é imediato, reforçando o modo *offline first*.

Usuários que experimentaram as primeiras versões destacaram a clareza das instruções e a sensação de progresso constante. Os relatórios de métricas ajudaram a identificar pontos em que havia abandono de tarefas, levando ao ajuste de textos e à inserção de dicas visuais.

De modo geral, o TACO provou ser uma solução viável para padronizar treinamentos. As melhorias sugeridas incluem gráficos ainda mais detalhados, integração opcional com serviços em nuvem e colaboração em tempo real.
# Conclusão e Trabalhos Futuros

O projeto TACO atingiu o principal objetivo de fornecer uma ferramenta simples para padronizar treinamentos e procedimentos. O modo offline garantiu acesso mesmo em locais sem internet, e o registro de execuções permitiu acompanhar a evolução dos usuários com precisão.

A combinação de PWA, armazenamento local e interface reativa mostrou-se eficiente para entregar uma experiência fluida. Os testes de usabilidade indicaram que o editor atende às necessidades de diferentes equipes, enquanto os relatórios gerados trazem visibilidade sobre o andamento das tarefas.

Como próximos passos, pretende-se explorar integrações com serviços em nuvem, de modo a permitir sincronização opcional e colaboração em tempo real. Também é desejável ampliar os tipos de componentes disponíveis e oferecer gráficos mais detalhados de performance.

Em síntese, o TACO contribui para reduzir o tempo de onboarding e melhorar a rastreabilidade das atividades. A expectativa é que a ferramenta continue evoluindo e impacte positivamente a produtividade de equipes nos mais diversos setores.
# Sessão de Perguntas

Ao final da apresentação, reserva-se um período de aproximadamente seis minutos para esclarecimentos. A banca é convidada a questionar detalhes do funcionamento do TACO, as decisões de projeto e possíveis aplicações práticas.

É importante controlar o tempo para que todos possam participar. Estou aberto a sugestões e comentários que contribuam para o aprimoramento da ferramenta.
# Encerramento

Agradeço ao orientador, aos colegas de curso e à banca avaliadora por acompanharem esta jornada. Espero que o TACO possa contribuir para a melhoria de treinamentos e procedimentos nas organizações.

Convido a todos para experimentarem a aplicação e enviarem sugestões. Muito obrigado pela atenção.
