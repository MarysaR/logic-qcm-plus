/**
 * Classe de base pour toutes les erreurs métier de l'application.
 *
 * Toutes les erreurs spécifiques herite de cette classe
 * et peuvent surcharger la méthode toHttpError() avec
 * un code HTTP spécifique.
 */
export abstract class AppError extends Error {
  code: number;
  constructor(
    message: string = "Erreur interne du serveur",
    code: number = 500
  ) {
    super(message);
    this.code = code;
    this.name = new.target.name;
  }

  /**
   * Conversion standardisée en réponse HTTP.
   *
   * Les classes filles peuvent surcharger cette méthode
   * pour fournir un code HTTP ou un message spécifique.
   */
  public toHttpError(): { code: number; message: string } {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
