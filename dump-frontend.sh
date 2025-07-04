#!/usr/bin/env bash
# dump-frontend.sh — concatena o código-fonte relevante do frontend em um único arquivo (frontend.txt)

set -euo pipefail

OUTPUT="frontend.txt"        # arquivo final
TMP="$(mktemp)"              # arquivo temporário seguro

# ────────────────────────────────────────────────────────────────────────────────
# Diretórios a ignorar (build, dependências, caches, etc.)
# ────────────────────────────────────────────────────────────────────────────────
EXCLUDE_DIRS=(
  "./node_modules/*"
  "./dist/*"                "./build/*"
  "./public/*"              "./coverage/*"
  "./.git/*"                "./.turbo/*"     "./.cache/*"
  "./.next/*"               "./.nuxt/*"      "./.svelte-kit/*"
  "./cypress/*"             "./storybook-static/*"
)

# Arquivos/padrões a ignorar (lockfiles, tipos gerados, mapas de source, imagens…)
EXCLUDE_FILES=(
  "package-lock.json" "pnpm-lock.yaml" "yarn.lock" "bun.lockb"
  "*.d.ts" "*.map"
  "*.ico"  "*.png" "*.jpg" "*.jpeg" "*.svg" "*.webp" "*.gif"
  "*.woff" "*.woff2" "*.ttf"
  "*.mp4"  "*.mp3"  "*.mov"
  "$OUTPUT" "$(basename "$0")"
)

# ────────────────────────────────────────────────────────────────────────────────
# Monta a expressão do find
# ────────────────────────────────────────────────────────────────────────────────
DIR_EXPR=()
for dir in "${EXCLUDE_DIRS[@]}"; do
  DIR_EXPR+=(-path "$dir" -o)
done
unset 'DIR_EXPR[${#DIR_EXPR[@]}-1]'          # remove o último “-o”
DIR_EXPR=( \( "${DIR_EXPR[@]}" \) -prune -o )

FILE_EXPR=()
for f in "${EXCLUDE_FILES[@]}"; do
  FILE_EXPR+=(-name "$f" -o)
done
unset 'FILE_EXPR[${#FILE_EXPR[@]}-1]'
FILE_EXPR=( \( "${FILE_EXPR[@]}" \) -prune -o )

# ────────────────────────────────────────────────────────────────────────────────
# Concatena cada arquivo de código em ordem alfabética
# ────────────────────────────────────────────────────────────────────────────────
find . "${DIR_EXPR[@]}" "${FILE_EXPR[@]}" -type f -print0 | sort -z |
while IFS= read -r -d '' file; do
  {
    printf '________________\n'
    printf '...%s\n' "${file#./}"
    printf '_______________\n'
    cat "$file"
    printf '\n\n'
  } >> "$TMP"
done

mv "$TMP" "$OUTPUT"
echo "✔ Arquivo “$OUTPUT” gerado com sucesso."
