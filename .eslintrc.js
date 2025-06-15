module.exports = {
  parser: "@typescript-eslint/parser",        // Utilise le parser TypeScript
  plugins: ["@typescript-eslint", "prettier"], // Active les plugins TS et Prettier
  extends: [
    "eslint:recommended",                     // Règles ESLint de base
    "@typescript-eslint/recommended",         // Règles TypeScript recommandées
    "prettier"                               // Désactive les règles conflictuelles avec Prettier
  ],
  rules: {
    "prettier/prettier": "error",             // Erreur si code mal formaté
    "no-try": "error",                       // Interdit try/catch (Pattern Result obligatoire)
    "eqeqeq": ["error", "never"],            // Interdit === et !== (comparaisons typées TS)
    "@typescript-eslint/no-explicit-any": "error" // Interdit any (force types explicites)
  }
};
