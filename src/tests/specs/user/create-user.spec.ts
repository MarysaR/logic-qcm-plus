import { AlreadyExistError, PermissionDeniedError, ValidationError } from '../../../errors/errors';
import { User } from  '../../../entities/user/user';
import { CreateUserUseCase } from '../../../usecases/user/createUserUseCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { Err, Ok } from '../../../errors/result';
import { RoleEnum } from '../../../enums/roleEnums';


describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      getCurrentUser: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockRepository);
  });


  it('should throw ValidationError if a required field is empty', async () => {
    const user: User = {
        login: '',
        email: 'newuser@gmail.com',
        password: 'randomPassword1!',
        firstName: 'Lola',
        lastName: 'Vander',
        company: 'Tales',
        id: 0,
        isActive: false,
        roleId: 2,
        role: {
            id: 2, name: RoleEnum.STAGIAIRE,
            isActive: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const currentUserRole = RoleEnum.ADMIN;

    await expect(useCase.createUser(currentUserRole, user)).rejects.toThrow(ValidationError);
});

it('should throw ValidationError if email is empty', async () => {
  const user: User = {
      login: 'newuser',
      email: '',
      password: 'randomPassword1!',
      firstName: 'Lola',
      lastName: 'Vander',
      company: 'Tales',
      id: 0,
      isActive: false,
      roleId: 2,
      role: {
          id: 2, name: RoleEnum.STAGIAIRE,
          isActive: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
  };

  const currentUserRole = RoleEnum.ADMIN;

  await expect(useCase.createUser(currentUserRole, user)).rejects.toThrow(ValidationError);
});


  it('should throw ValidationError if password is empty', async () => {
    const user: User = {
        login: 'newuser',
        email: 'newuser@gmail.com',
        password: '',
        firstName: 'Lola',
        lastName: 'Vander',
        company: 'Tales',
        id: 0,
        isActive: false,
        roleId: 2,
        role: {
            id: 2, name: RoleEnum.STAGIAIRE,
            isActive: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const currentUserRole = RoleEnum.ADMIN;

    await expect(useCase.createUser(currentUserRole, user)).rejects.toThrow(ValidationError);
  });



  it('should throw AlreadyExistError if email already exists', async () => {
    const user: User = {
      login: 'newuser',
      email: 'existinguser@gmail.com',
      password: 'StrongPass1!',
      firstName: 'Lola',
      lastName: 'Vander',
      company: 'Tales',
      id: 0,
      isActive: false,
      roleId: 2,
      role: {
          id: 2, name: RoleEnum.STAGIAIRE,
          isActive: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentUserRole = RoleEnum.ADMIN;
  
    mockRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(user));
  
    await expect(useCase.createUser(currentUserRole, user)).rejects.toThrow(AlreadyExistError);
  });


it('should throw WeakPasswordError if password is too weak', async () => {
  const user: User = {
    login: 'newuser',
    email: 'newuser@gmail.com',
    password: '123',
    firstName: 'Lola',
    lastName: 'Vander',
    company: 'Tales',
    id: 0,
    isActive: false,
    roleId: 2,
    role: {
        id: 2, name: RoleEnum.STAGIAIRE,
        isActive: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const currentUserRole = RoleEnum.ADMIN;

  await expect(useCase.createUser(currentUserRole, user)).rejects.toThrow(ValidationError);
});



it('should throw InvalidEmailError if email format is incorrect', async () => {
  const user: User = {
    login: 'newuser',
    email: 'invalid-email',
    password: 'StrongPass1!',
    firstName: 'Lola',
    lastName: 'Vander',
    company: 'Tales',
    id: 0,
    isActive: false,
    roleId: 2,
    role: {
        id: 2, name: RoleEnum.STAGIAIRE,
        isActive: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  
  const currentUserRole = RoleEnum.ADMIN;


  await expect(useCase.createUser(currentUserRole, user)).rejects.toThrow(ValidationError);
});



it('should throw ForbiddenError if current user is not admin', async () => {
  const userToCreate: User = {
    login: 'newuser',
    email: 'newuser@gmail.com',
    password: 'StrongPass1!',
    firstName: 'Lola',
    lastName: 'Vander',
    company: 'Tales',
    id: 0,
    isActive: false,
    roleId: 2,
    role: {
      id: 2,
      name: RoleEnum.STAGIAIRE,
      isActive: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const currentUserRole = RoleEnum.STAGIAIRE;


  await expect(useCase.createUser(currentUserRole, userToCreate)).rejects.toThrow(PermissionDeniedError);
});


  

});