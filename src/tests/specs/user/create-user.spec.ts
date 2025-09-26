import { AlreadyExistError, ValidationError } from '../../../errors/errors';
import { User } from  '../../../entities/user/user';
import { CreateUserUseCase } from '../../../usecases/user/createUserUseCase';
import { UserRepository } from '../../../interfaces/userRepository';


describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      getCurrentUser: jest.fn()
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
        roleId: 1,
        role: {
            id: 1, name: 'Stagiaire',
            isActive: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await expect(useCase.createUser(user)).rejects.toThrow(ValidationError);
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
      roleId: 1,
      role: {
          id: 1, name: 'Stagiaire',
          isActive: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
  };

  await expect(useCase.createUser(user)).rejects.toThrow(ValidationError);
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
        roleId: 1,
        role: {
            id: 1, name: 'Stagiaire',
            isActive: true
        } ,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await expect(useCase.createUser(user)).rejects.toThrow(ValidationError);
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
      roleId: 1,
      role: {
        id: 1,
        name: 'Stagiaire',
        isActive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    mockRepository.getUserByEmail.mockResolvedValueOnce({
      isOk: () => true,
      isErr: () => false,
      value: user,
    });
  
    await expect(useCase.createUser(user)).rejects.toThrow(AlreadyExistError);
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
    roleId: 1,
    role: {
      id: 1,
      name: 'Stagiaire',
      isActive: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await expect(useCase.createUser(user)).rejects.toThrow(ValidationError);
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
    roleId: 1,
    role: {
      id: 1,
      name: 'Stagiaire',
      isActive: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await expect(useCase.createUser(user)).rejects.toThrow(ValidationError);
});


  

});