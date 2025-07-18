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
