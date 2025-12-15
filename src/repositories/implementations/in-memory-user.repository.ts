import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
    private users = new Map<string, User>();

    async create(user: User): Promise<User> {
        this.users.set(user.id, user);
        return user;
    }

    async findById(userId: string): Promise<User | null> {
        return this.users.get(userId) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return (
            Array.from(this.users.values()).find(
                (user) => user.email === email,
            ) || null
        );
    }

    async update(user: User): Promise<void> {
        this.users.set(user.id, user);
    }

    async delete(userId: string): Promise<void> {
        this.users.delete(userId);
    }

    async findAll(): Promise<User[]> {
        return Array.from(this.users.values());
    }
}
