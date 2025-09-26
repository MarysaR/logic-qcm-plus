// import { GetRoleUseCase } from '../../../usecases/role/getRoleUseCase';
// import { UserRepository } from '../../../interfaces/userRepository';
// import { Err, Ok } from '../../../errors/result';
// import { NotFoundError } from '../../../errors/errors';

// describe('GetRoleUseCase', () => {
//     let userRepository: jest.Mocked<UserRepository>;
//     let getRoleUseCase: GetRoleUseCase;

//     beforeEach(() => {

//         userRepository = {
//             getRoleById: jest.fn(),
//         } as unknown as jest.Mocked<UserRepository>;

//         getRoleUseCase = new GetRoleUseCase(userRepository);
//     });

//     it('should return a role if it exists', async () => {

//         const mockRole = { id: 1, name: 'Admin', isActive: true };
//         userRepository.getRoleById.mockResolvedValue(Ok.of(mockRole));

   
//         const result = await getRoleUseCase.execute(1);

//         expect(userRepository.getRoleById).toHaveBeenCalledWith(1);
//         expect(result).toEqual(mockRole);
//     });

//     it('should throw NotFoundError if the role does not exist', async () => {

//         userRepository.getRoleById.mockResolvedValue(Err.of(new NotFoundError()));

//         await expect(getRoleUseCase.execute(999)).rejects.toThrow(NotFoundError);
//         expect(userRepository.getRoleById).toHaveBeenCalledWith(999);
//     });
// });