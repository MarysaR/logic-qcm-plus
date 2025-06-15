module.exports = {
  preset: 'ts-jest', // Utilise ts-jest pour TypeScript
  testEnvironment: 'node', // Environnement Node.js
  testMatch: [
    '**/src/tests/specs/**/*.spec.ts', // Cherche les tests dans specs/
  ],
  collectCoverageFrom: [
    'src/**/*.ts', // Calcule la couverture sur tout src/
    '!src/tests/**', // Exclut les tests de la couverture
    '!src/index.ts', // Exclut le point d\'entrée
  ],
  coverageDirectory: 'coverage', // Dossier pour les rapports de couverture
  verbose: true, // Affichage détaillé des tests
};
