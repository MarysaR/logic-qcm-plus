// import { UserRepository } from '../../interfaces/userRepository';
// import { Role } from '../../entities/roles/role';
// import { NotFoundError } from '../../errors/errors';

// export class GetRoleUseCase {
//     private userRepository: UserRepository;

//     constructor(userRepository: UserRepository) {
//         this.userRepository = userRepository;
//     }

//     async execute(roleId: number): Promise<Role> {
//         const result = await this.userRepository.getRoleById(roleId);

//         if (result.isErr()) {
//             throw new NotFoundError(`Role with ID ${roleId} not found`);
//         }

//         return result.value;
//     }
// }