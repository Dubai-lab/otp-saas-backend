import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

type CreateUserInput = Pick<User, 'email' | 'fullName' | 'password' | 'role'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(data: CreateUserInput) {
    const u = this.repo.create(data);
    return this.repo.save(u);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findAll() {
    return this.repo.find();
  }

  async updateRole(userId: string, role: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) return null;

    user.role = role as 'user' | 'admin';
    return this.repo.save(user);
  }

  async update(
    userId: string,
    data: Partial<Pick<User, 'password' | 'fullName' | 'email'>>,
  ) {
    await this.repo.update(userId, data);
    return this.findById(userId);
  }
}
