# Fundamentação Teórica

Para embasar o desenvolvimento do TACO, foram pesquisados conceitos relacionados a aplicações _offline first_, banco de dados no navegador e metodologias de modelagem de processos. A seguir são apresentados os principais fundamentos que orientaram o projeto.

## Aplicações Web Progressivas

As PWAs (_Progressive Web Apps_) combinam as vantagens das aplicações nativas com a flexibilidade das páginas web. No TACO, optou-se por essa abordagem para permitir instalação em diferentes dispositivos e execução mesmo sem acesso contínuo à rede. A especificação de _service workers_ e o manifesto da aplicação viabilizam o armazenamento de recursos estáticos e a exibição de notificações.

## Persistência Local com IndexedDB

Dentre as tecnologias de armazenamento local, o IndexedDB foi escolhido por oferecer uma estrutura de banco de dados orientada a objetos que suporta transações e consultas complexas. A biblioteca Dexie foi utilizada como camada de abstração, simplificando operações de leitura e escrita. Assim, é possível guardar os fluxos definidos pelo usuário, registrar eventos e recuperar o histórico de interações de maneira performática.

## Modelagem de Processos e Grafos de Transição

A organização dos fluxos no TACO baseia-se em grafos direcionados, onde cada passo representa um vértice e as transições correspondem às arestas. Esse modelo facilita a representação de caminhos alternativos e a verificação de consistência do fluxo. Além disso, a estrutura de grafo permite gerar estatísticas de navegação, como quais etapas são mais frequentes e onde ocorrem desistências.

## Interfaces Reativas

A escolha do React com TypeScript proporcionou tipagem estática e componentes reutilizáveis. Com o auxílio do Vite para _bundling_ e do Tailwind CSS para estilização, a interface permanece responsiva e modulável. O uso de bibliotecas como Radix UI garante acessibilidade, enquanto o Zustand gerencia de forma simples o estado global da aplicação.
