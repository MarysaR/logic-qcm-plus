# Étape 1 : Build + tests
FROM node:lts-alpine AS builder

WORKDIR /app

# 1️⃣ Copie des fichiers de configuration et du code source
COPY tsconfig.json package*.json ./
COPY src/ ./src/

# 2️⃣ Installation des dépendances
#    – npm ci lance prepare (build) automatiquement,
#      mais src/ est déjà présent, donc tsc trouve ses fichiers.
RUN npm ci

# 3️⃣ Build et tests
RUN npm test -- --coverage

# Étape 2 : image finale prête pour inclusion dans un autre projet
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

# Copie le résultat du build uniquement
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/package.json ./
