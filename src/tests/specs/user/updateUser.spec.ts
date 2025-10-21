import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UpdateUserUseCase } from '../../../usecases/user/updateUserCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { User } from '../../../entities/user/user';
import { RoleEnum } from '../../../enums/roleEnums';
import { Err, Ok } from '../../../errors/result';
import {
  PermissionDeniedError,
  TechnicalError,
  ValidationError,
} from '../../../errors/errors';
import { userBuilder } from '../../builders/user-builder';

describe('Feature: UpdateUserUseCase', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;
  let useCase: UpdateUserUseCase;
  let updatedUser: User;
  let adminUser: User;

  beforeEach(() => {
    mockUserRepo = {
      getUserByEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
    };

    useCase = new UpdateUserUseCase(mockUserRepo);

    adminUser = userBuilder()
      .withId(1)
      .withFirstName('Admin')
      .withLastName('User')
      .withLogin('admin')
      .withEmail('admin@example.com')
      .withPassword('AdminPass1!')
      .withCompany('Socomec')
      .withRole(RoleEnum.ADMIN)
      .build();

    updatedUser = userBuilder()
      .withId(2)
      .withFirstName('Updated')
      .withLastName('User')
      .withLogin('updatedUser')
      .withEmail('updated@example.com')
      .withPassword('StrongPass1!')
      .withCompany('Socomec')
      .withRole(RoleEnum.STAGIAIRE)
      .build();
  });

  it('should return PermissionDeniedError if current user is not admin', async () => {
    const nonAdminUser = { ...adminUser, roleId: RoleEnum.STAGIAIRE };

    const result = await useCase.execute(nonAdminUser, updatedUser);

    expect(result).toEqual(
      Err.of(
        new PermissionDeniedError(
          'Seul un administrateur peut modifier un questionnaire'
        )
      )
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError if updated user has no ID', async () => {
    const invalidUser = { ...updatedUser, id: 0 };

    const result = await useCase.execute(adminUser, invalidUser);

    expect(result).toEqual(
      Err.of(new ValidationError('ID de l’utilisateur à modifier manquant'))
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return TechnicalError if repository fails', async () => {
    mockUserRepo.updateUser.mockResolvedValueOnce(
      Err.of(new TechnicalError('DB error'))
    );

    const result = await useCase.execute(adminUser, updatedUser);

    expect(result).toEqual(
      Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour de l’utilisateur'
        )
      )
    );
    expect(mockUserRepo.updateUser).toHaveBeenCalledWith(updatedUser);
  });

  it('should return Ok with updated user on success', async () => {
    mockUserRepo.updateUser.mockResolvedValueOnce(Ok.of(updatedUser));

    const result = await useCase.execute(adminUser, updatedUser);

    expect(result).toEqual(Ok.of(updatedUser));
    expect(mockUserRepo.updateUser).toHaveBeenCalledWith(updatedUser);
  });

  it('should return ValidationError when firstName is empty', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = { ...userBuilder().withId(5).build(), firstName: '' };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(Err.of(new ValidationError('Prénom obligatoire')));
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when lastName is empty', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = { ...userBuilder().withId(5).build(), lastName: '' };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(Err.of(new ValidationError('Nom obligatoire')));
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when login is empty', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = { ...userBuilder().withId(5).build(), login: '' };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(Err.of(new ValidationError('Login obligatoire')));
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when email is empty', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = {
      ...userBuilder().withId(5).build(),
      email: '',
      company: 'SomeCompany',
    };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(Err.of(new ValidationError('Email obligatoire')));
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when email format is invalid', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = {
      ...userBuilder().withId(5).build(),
      email: 'invalid-email-format',
      company: 'SomeCompany',
    };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(Err.of(new ValidationError('Email invalide')));
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when company is empty', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = { ...userBuilder().withId(12).build(), company: '' };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(
      Err.of(new ValidationError('Entreprise obligatoire'))
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when password is empty', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = {
      ...userBuilder().withId(13).build(),
      password: '',
      company: 'SomeCompany',
    };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(
      Err.of(new ValidationError('Mot de passe obligatoire'))
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('should return ValidationError when password lacks complexity', async () => {
    const admin = userBuilder().withRole(RoleEnum.ADMIN).build();
    const userToUpdate = {
      ...userBuilder().withId(14).build(),
      password: 'fake-mot-de-passe',
      company: 'SomeCompany',
    };
    const result = await useCase.execute(admin, userToUpdate);
    expect(result).toEqual(
      Err.of(
        new ValidationError(
          'Mot de passe invalide (8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)'
        )
      )
    );
    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });
});
