import {
  AlreadyExistError,
  PermissionDeniedError,
  ValidationError,
} from '../../../errors/errors';
import { User } from '../../../entities/user/user';
import { CreateUserUseCase } from '../../../usecases/user/createUserUseCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { Ok } from '../../../errors/result';
import { PasswordHasher } from '../../../providers/passwordHash';
import { RoleEnum } from '../../../enums/roleEnums';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let user: User;
  let currentUser: User;

  beforeEach(() => {
    mockRepository = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      getCurrentUser: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashedPassword'),
      compare: jest.fn().mockResolvedValue(true),
    };

    user = {
      login: 'login',
      email: 'newuser@gmail.com',
      password: 'randomPassword1!',
      firstName: 'Lola',
      lastName: 'Vander',
      company: 'Tales',
      id: 0,
      isActive: false,
      roleId: 2,
      role: {
        id: 2,
        name: RoleEnum.STAGIAIRE.toString(),
        isActive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    currentUser = {
      login: 'ADMIN',
      email: 'admin@gmail.com',
      password: 'randomPassword1!',
      firstName: 'admin',
      lastName: 'admin',
      company: 'Tales',
      id: 1,
      isActive: false,
      roleId: 1,
      role: {
        id: 1,
        name: RoleEnum.ADMIN.toString(),
        isActive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    useCase = new CreateUserUseCase(mockRepository, passwordHasher);
  });

  it('should return PermissionDeniedError if current user is not admin', async () => {
    currentUser.roleId = RoleEnum.STAGIAIRE;

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(PermissionDeniedError);
      expect(result.error.message).toBe(
        'Vous n’avez pas les droits pour créer un utilisateur.'
      );
    }
  });

  it('should return ValidationError if a required field is empty', async () => {
    user.login = '';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }
  });

  it('should return ValidationError if email is empty', async () => {
    user.email = '';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }
  });

  it('should return ValidationError if password is empty', async () => {
    user.password = '';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }
  });

  it('should return ValidationError if lastName is empty', async () => {
    user.lastName = '';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }
  });

  it('should return ValidationError if firstName is empty', async () => {
    user.firstName = '';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }
  });

  it('should return ValidationError if company is empty', async () => {
    user.company = '';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'All fields are required: login, email, password, firstName, lastName, company'
      );
    }
  });

  it('should return AlreadyExistError if email already exists', async () => {
    mockRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(user));

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(AlreadyExistError);
      expect(result.error.message).toBe(
        `L'email "${user.email}" est déjà utilisé.`
      );
    }
  });

  it('should return ValidationError if password is too weak', async () => {
    user.password = 'weakpass';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
    }
  });

  it('should return ValidationError if email format is incorrect', async () => {
    user.email = 'invalidemailformat';

    const result = await useCase.createUser(currentUser, user);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe('Invalid email format.');
    }
  });
});
