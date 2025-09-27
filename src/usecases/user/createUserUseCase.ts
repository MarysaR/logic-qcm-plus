import { UserRepository } from '../../interfaces/userRepository';
import { User } from '../../entities/user/user';
import { ValidationError, AlreadyExistError, PermissionDeniedError } from '../../errors/errors';
import { RoleEnum } from '../../enums';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async createUser(currentUserRole: RoleEnum, user: User): Promise<{ success: boolean }> {

  if (currentUserRole !== RoleEnum.ADMIN) {
    throw new PermissionDeniedError('Vous n’avez pas les droits pour créer un utilisateur.');
  }


    const requiredFields = [
      user.login,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.company,
    ];

    if (requiredFields.some((field) => !field || field.trim() === '')) {
      throw new ValidationError(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new ValidationError('Invalid email format.');
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(user.password)) {
      throw new ValidationError(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
    }

    const userEmailAlreadyExists = await this.userRepository.getUserByEmail(
      user.email
    );
    if (userEmailAlreadyExists.isOk()) {
      throw new AlreadyExistError(`L'email "${user.email}" est déjà utilisé.`);
    }

    user.createdAt = new Date();
    user.isActive = true;
    
    user.role = { id: 2, name: 'STAGIAIRE', isActive: true };
    user.roleId = 2;

    await this.userRepository.createUser(user);

    return { success: true };
  }
}