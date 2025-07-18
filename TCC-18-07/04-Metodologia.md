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
