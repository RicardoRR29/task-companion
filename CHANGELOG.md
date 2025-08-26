# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Unreleased]

### Added

- **GPT-5 Mini Integration**: Sistema atualizado para usar o modelo GPT-5 Mini da OpenAI
- **Centralized AI Configuration**: Novo arquivo `src/config/ai.ts` para configurações centralizadas de IA
- **AI Setup Documentation**: Documentação completa em `docs/ai-setup.md` para configuração da IA

### Changed

- **Model Update**: Alterado de `gpt-4o-mini` para `gpt-5-mini` para melhor performance e custo-benefício
- **Configuration Refactor**: Refatorado `AIFlowModal.tsx` para usar configurações centralizadas
- **README Update**: Atualizado README.md para mencionar o uso do GPT-5 Mini

### Technical Improvements

- **Type Safety**: Adicionados tipos TypeScript para modelos de IA disponíveis
- **Error Handling**: Melhorado tratamento de erros e validação de configuração
- **Code Organization**: Reorganizado código para melhor manutenibilidade

## [Previous Versions]

### v0.0.0

- **Initial Release**: Sistema base com GPT-4o Mini
- **Core Features**: Criação, edição e execução de fluxos interativos
- **AI Assistant**: Assistente básico para criação de fluxos
- **Analytics**: Sistema de métricas e relatórios
- **PWA Support**: Aplicação web progressiva com Capacitor
