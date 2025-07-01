# Contribution au projet Logic

## Structure des branches

Le projet utilise une stratégie de branches stricte pour garantir la stabilité, la traçabilité et la qualité du code.

### Branches principales

* `main` : version stable, livrable et démontrable.
* `develop` : intégration des fonctionnalités en cours de lot.

### Branches de travail

* `feat/<nom>` : développement d'une fonctionnalité métier (TDD strict).
* `fix/<nom>` : correction ciblée d’un bug. Aucun test associé exigé.

---

## Création des branches

### Initialisation locale (1ère fois)

Avant la première utilisation du script de création de branche :

```bash
chmod +x tools/create-branch.sh
```

Utiliser ensuite la commande suivante pour créer une branche en respectant la convention :

```bash
npm run create:branch -- feat Ajouter l'authentification stagiaire
```

Cette commande va :

* Se placer automatiquement sur `develop`
* Vérifier que la branche n’existe pas déjà
* Convertir le nom en kebab-case
* Créer la branche au format `feat/ajouter-lauthentification-stagiaire`

---

## Règles générales

### `main`

* Interdiction de modifier directement cette branche.
* Ne recevoir que des fusions de `develop`.
* Contenu toujours stable et démontrable.

### `develop`

* Aucune modification directe.
* Fusion uniquement de branches `feat/*` ou `fix/*`.
* Tous les tests doivent passer avant fusion.

---

## Fonctionnalités (`feat/<nom>`)

* Création depuis `develop` uniquement.
* Développement selon le cycle TDD (test rouge → implémentation → refactorisation).
* Tests unitaires obligatoires.
* Nettoyage obligatoire avant fusion (logs, commentaires, fichiers temporaires).

---

## Correctifs (`fix/<nom>`)

* Création depuis `develop` uniquement.
* Portée strictement limitée au correctif.
* Aucun test unitaire associé requis.
* Vérification manuelle suffisante avant fusion.

---

## Règles de fusion

| Source    | Cible     | Autorisé | Conditions                                                      |
| --------- | --------- | -------- | --------------------------------------------------------------- |
| `feat/*`  | `develop` | Oui      | Tests passés, code propre, conforme au besoin                   |
| `fix/*`   | `develop` | Oui      | Correctif ciblé et vérifié manuellement                         |
| `develop` | `main`    | Oui      | Fin de lot ou jalon validé. Tout le contenu est testé et stable |
| `main`    | `develop` | Non      | Interdiction absolue                                            |
| `develop` | `feat/*`  | Oui      | Rebase autorisé pour synchronisation locale                     |

---

## Bonnes pratiques

* Commits clairs et explicites : `feat: ajout de la création de questionnaire`, `fix: doublon autorisé`
* Aucun code mort, `console.log` ou commentaire temporaire ne doit être mergé.
* La qualité et la lisibilité du code sont prioritaires.

---

## Contrôles automatiques GitHub (Workflows CI)

### 1. CI standard (`.github/workflows/ci.yml`)

* Exécuté sur `main` et `develop`
* Vérifie : compilation TypeScript, ESLint, Prettier, tests unitaires Jest

### 2. CI allégée pour `feat/*` et `fix/*` (`ci-feature.yml`)

* Exécuté uniquement pour les PR vers `develop`
* Vérifie uniquement les tests (exécution rapide)

### 3. Convention de nommage de branches (`branch-convention.yml`)

* Interdit les push directs sur `main` et `develop`
* Refuse toute branche ne préfixant pas par `feat/` ou `fix/`

### 4. Convention de nommage des PR (`pr-convention.yml`)

* Empêche les PR vers `main` ou `develop` depuis une branche non conforme
* Refuse par exemple `feature/...` ou `ajout-auth`, impose `feat/...` ou `fix/...`

---

## Exemple de cycle complet

1. L'utilisateur lance :

   ```bash
   npm run create:branch -- feat/mre_add_user_back
   ```

2. Le script crée `feat/mre_add_user_back` depuis `develop`

3. Une fois terminé, une PR est ouverte vers `develop`

4. Les workflows vérifient :

   * le nom de la branche
   * le nom de la PR
   * les tests
   * le lint, le format, la compilation si vers `develop`

5. Une fois la PR approuvée, elle est mergée dans `develop`

6. `develop` est mergé dans `main` à la fin du lot (version stable)
