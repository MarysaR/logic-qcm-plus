import { AlreadyExistError, PermissionDeniedError, ValidationError } from '../../../errors/errors';
import { User } from  '../../../entities/user/user';
import { CreateUserUseCase } from '../../../usecases/user/createUserUseCase';
import { UserRepository } from '../../../interfaces/userRepository';
import { Ok } from '../../../errors/result';
import { RoleEnum } from '../../../enums/roleEnums';


describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;
  let user: User;
  let currentUserRole: number;

  beforeEach(() => {
    mockRepository = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      getCurrentUser: jest.fn(),
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
          id: 2, name: RoleEnum.STAGIAIRE,
          isActive: true
      },
      createdAt: new Date(),
      updatedAt: new Date(),
  };

   currentUserRole = 1;

    useCase = new CreateUserUseCase(mockRepository);
  });


  it('should return ValidationError if a required field is empty', async () => {

    user.login = '';


    const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('All fields are required: login, email, password, firstName, lastName, company');
  }
});

it('should return ValidationError if email is empty', async () => {
   user.email = '';



   const result = await useCase.createUser(currentUserRole, user);

   expect(result.isErr()).toBe(true);
 
   if (result.isErr()) {
     expect(result.error).toBeInstanceOf(ValidationError);
     expect(result.error.message).toBe('All fields are required: login, email, password, firstName, lastName, company');
   }
});

  it('should return ValidationError if password is empty', async () => {

    user.password = '';


    const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('All fields are required: login, email, password, firstName, lastName, company');
  }
  });

  it('should return ValidationError if lastName is empty', async () => {

    user.lastName = '';

    const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('All fields are required: login, email, password, firstName, lastName, company');
  }
  });

  it('should return ValidationError if firstName is empty', async () => {

    user.firstName = '';


    const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('All fields are required: login, email, password, firstName, lastName, company');
  }
  });

  it('should return ValidationError if company is empty', async () => {

    user.company = '';


    const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('All fields are required: login, email, password, firstName, lastName, company');
  }
  });



  it('should return AlreadyExistError if email already exists', async () => {

  
    mockRepository.getUserByEmail.mockResolvedValueOnce(Ok.of(user));

    const result = await useCase.createUser(currentUserRole, user);
  
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(AlreadyExistError);
      expect(result.error.message).toBe(`L'email "${user.email}" est déjà utilisé.`);
    }
  });


it('should return ValidationError if password is too weak', async () => {

  user.password = 'weakpass';



  const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
  }
});


it('should return ValidationError if email format is incorrect', async () => {
  user.email = 'invalidemailformat';

  const result = await useCase.createUser(currentUserRole, user);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error.message).toBe('Invalid email format.');
  }
});






it('should return PermissionDeniedError if current user is not admin', async () => {
  const currentUserRole = 2;

  const result = await useCase.createUser(currentUserRole, user);

    expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(PermissionDeniedError);
    expect(result.error.message).toBe('Vous n’avez pas les droits pour créer un utilisateur.');
  }
})


  

});