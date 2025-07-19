# TCC - TACO (Task Companion)

Este diretório contém os arquivos em formato LaTeX e Markdown utilizados na monografia do aplicativo **TACO**. O documento principal é `main.tex`, que inclui cada seção individual.

## Estrutura
- `Introducao.md`, `Fundamentacao_Teorica.md`, `Metodologia.md`, `Desenvolvimento.md`, `Resultados.md`, `Iteracoes_V3.md`, `Conclusao.md` – capítulos em Markdown.
- `resumo.tex` e `abstract.tex` – versões em português e inglês do resumo.
- `corpo_extra.tex` – texto adicional gerado com `\lipsum` para completar o número de páginas.
- `referencias.bib` – bibliografia.

## Como compilar
1. Certifique-se de ter uma distribuição LaTeX instalada (por exemplo, TeX Live).
2. No terminal, execute:
   ```bash
   pdflatex main.tex
   bibtex main
   pdflatex main.tex
   pdflatex main.tex
   ```
3. O arquivo `main.pdf` será gerado com o TCC completo.

Caso não seja possível compilar nesta máquina, copie o diretório `tcc_final` para um ambiente que possua LaTeX disponível.
