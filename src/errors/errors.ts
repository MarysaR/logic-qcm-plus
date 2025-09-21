import { AppError } from './appError';

export class NotFoundError extends AppError {
  constructor(message: string = 'Non trouvé') {
    super(message, 404);
  }
}

export class AlreadyExistError extends AppError {
  constructor(message: string = 'La ressource existe déjà') {
    super(message, 409);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflit empêchant l'opération demandée") {
    super(message, 409);
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message: string = 'Accès interdit') {
    super(message, 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Requête invalide') {
    super(message, 400);
  }
}

export class ValidationError extends BadRequestError {
  constructor(message: string = 'Erreur de validation') {
    super(message);
  }
}

export class TechnicalError extends AppError {
  constructor(message: string = 'Erreur technique interne') {
    super(message, 500);
  }
}

export class UnknownError extends AppError {
  constructor(message: string = 'Erreur inconnue') {
    super(message, 500);
  }
}
