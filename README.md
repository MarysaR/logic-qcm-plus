# QCM-PLUS Logic

## Rôle dans l'architecture

Ce package contient le **domaine métier** de l'application QCM-PLUS dans une architecture hexagonale.

### Responsabilités

- **Entités métier** : User, Questionnaire, Question, QuizSession
- **Interfaces/Contrats** : IUserRepository, IQuestionnaireRepository, IAuthService
- **Use Cases** : Logique métier pure (création questionnaires, passage quiz, calcul scores)
- **Types partagés** : Pattern Result, validations Zod

### Architecture hexagonale

┌─────────────┐ ┌──────────────┐
│ CLIENT │──────▶│ BACK │
│ (React) │ │ (Express) │
└─────────────┘ └─────┬────────┘
│
▼
┌─────────────────┐
│ LOGIC │
│ (Métier pur) │
└─────────────────┘

## Installation

```bash
  npm install
  npm run build
```

## Structure des dossiers

src/
├── entities/ # Entités métier
├── interfaces/ # Contrats entre couches
├── usecases/ # Cas d'usage métier
├── types/ # Types partagés (Result, etc.)
└── tests/
├── builders/ # Builders pour tests
├── fixtures/ # Données de test
└── specs/ # Tests unitaires

## Scripts disponibles

```bash
  npm run create:branch
  npm run build        # Compilation TypeScript
  npm run dev          # Watch mode
  npm run test         # Tests avec Jest
  npm run lint         # Vérification ESLint
  npm run lint:fix     # Correction automatique
  npm run format       # Formatage Prettier
```

## Pattern Result

Gestion d'erreurs sans try/catch :

```ts
import { Result, Ok, Err } from './types/result';
import { logger } from './config/logger';

// Utilisation
const result = someOperation();
if (result.isOk()) {
  logger.info({ data: result.value }, 'Operation successful');
} else {
  logger.error({ error: result.error }, 'Operation failed');
}
```

## Tests

Approche TDD par fonctionnalité :

- **Red** : Écrire un test pour une fonctionnalité (qui échoue)
- **Green** : Écrire le code minimal pour faire passer le test
- **Refactor** : Améliorer le code

```bash
  npm run test                   # Lancer tous les tests
  npm run test -- --watch        # Mode watch
  npm run test -- --coverage     # Avec couverture
```

### Tests organisés dans src/tests/specs/ par fonctionnalité

#### Organisation dans src/tests/specs/

```bash
  specs/
  ├── create-questionnaire.spec.ts    # Fonctionnalité création
  ├── submit-quiz.spec.ts             # Fonctionnalité passage quiz
  ├── calculate-score.spec.ts         # Fonctionnalité calcul score
  └── validate-user.spec.ts           # Fonctionnalité validation
```

Chaque test décrit UNE fonctionnalité précise.

## Docker

```bash
  docker build -t qcm-logic .
```

## Contraintes de développement

- **Zero try/catch** : Utilisation obligatoire du Pattern Result
- **Zero === / !==** : Comparaisons typées TypeScript uniquement
- **No explicit any** : Types explicites obligatoires
- **Functional programming** : Approche fonctionnelle privilégiée
- **Immutabilité** : Structures de données non mutables

## Contribution

Voir CONTRIBUTING.md pour les détails.
