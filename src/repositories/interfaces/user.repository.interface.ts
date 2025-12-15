import { User } from '../../domain/entities/user.entity';

export interface IUserRepository {
    /**
     * Create a new user
     */
    create(user: User): Promise<User>;

    /**
     * Find user by ID
     */
    findById(userId: string): Promise<User | null>;

    /**
     * Find user by email
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Update user
     */
    update(user: User): Promise<void>;

    /**
     * Delete user
     */
    delete(userId: string): Promise<void>;

    /**
     * Find all users
     */
    findAll(): Promise<User[]>;
}
