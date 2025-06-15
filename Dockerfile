# Étape 1 : Build + tests
FROM node:lts-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm test -- --coverage

# Étape 2 : image finale prête pour inclusion dans un autre projet
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/package.json ./

