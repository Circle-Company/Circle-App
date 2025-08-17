#!/bin/bash

echo "🔍 Verificando se há imports fora do topo dos arquivos..."

# Padrões de arquivos válidos
FILES=$(find ./src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \))

EXIT_CODE=0

for file in $FILES; do
  LINE_NUM=0
  IMPORT_DONE=false
  IN_IMPORT_BLOCK=false

  while IFS= read -r line || [[ -n "$line" ]]; do
    LINE_NUM=$((LINE_NUM + 1))
    TRIMMED_LINE=$(echo "$line" | sed 's/^[[:space:]]*//')

    # Ignora linhas em branco e comentários
    [[ "$TRIMMED_LINE" =~ ^$ ]] && continue
    [[ "$TRIMMED_LINE" =~ ^// ]] && continue
    [[ "$TRIMMED_LINE" =~ ^/\* ]] && continue

    # Início de import
    if [[ "$TRIMMED_LINE" =~ ^import[[:space:]] ]]; then
      if $IMPORT_DONE; then
        echo "❌ ERRO: Import fora do topo em $file:$LINE_NUM"
        EXIT_CODE=1
      fi
      IN_IMPORT_BLOCK=true
      continue
    fi

    # Continuação de import quebrado em várias linhas
    if $IN_IMPORT_BLOCK; then
      if [[ "$TRIMMED_LINE" == *\; ]]; then
        IN_IMPORT_BLOCK=false
      fi
      continue
    fi

    # Se chegou aqui, encontrou código real e marca o fim dos imports
    IMPORT_DONE=true
  done < "$file"
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Todos os imports estão no topo dos arquivos."
else
  echo "⚠️ Corrija os erros acima para evitar falhas no Hermes."
fi

exit $EXIT_CODE
