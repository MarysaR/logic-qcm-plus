#!/bin/bash

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Erreur : ce répertoire n'est pas un dépôt Git."
  exit 1
fi

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage : npm run create:branch -- feat|fix|chore|refactor nom-de-la-branche"
  exit 1
fi

TYPE=$1

if [[ "$TYPE" != "feat" && "$TYPE" != "fix" && "$TYPE" != "chore" && "$TYPE" != "refactor" ]]; then
  echo "Type de branche invalide : $TYPE (utiliser feat, fix, chore ou refactor)"
  exit 1
fi

RAW_NAME="${*:2}"

NAME=$(echo "$RAW_NAME" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | sed 's/[^a-z0-9\-]//g')
BRANCH_NAME="$TYPE/$NAME"

if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "La branche locale '$BRANCH_NAME' existe déjà. On se place dessus."
  git checkout "$BRANCH_NAME"
  exit 0
fi

if git ls-remote --exit-code --heads origin "$BRANCH_NAME" > /dev/null 2>&1; then
  echo "Erreur : la branche distante 'origin/$BRANCH_NAME' existe déjà."
  exit 1
fi

git checkout develop && git pull origin develop

git checkout -b "$BRANCH_NAME"

echo "Branche créée : $BRANCH_NAME"
