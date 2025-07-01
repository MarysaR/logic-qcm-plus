import { Err, Ok, Result } from '../types/result';

export class GetUsersUseCase {
    public execute(): Result<string[], Error> {
        const users = ['Alice', 'Bob', 'Charlie'];
        if (users.length > 0) {
            return Ok.of(users);
        } else {
            return Err.of(new Error('No users found'));
        }
    }
}
