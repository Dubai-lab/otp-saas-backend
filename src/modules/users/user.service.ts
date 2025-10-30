import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateProfileDto, UpdateSecurityDto } from './dto/update-user.dto';

type CreateUserInput = Pick<
  User,
  'email' | 'fullName' | 'password' | 'role' | 'planId'
>;

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

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    await this.repo.update(userId, updateProfileDto);
    return this.findById(userId);
  }

  async updateSecurity(userId: string, updateSecurityDto: UpdateSecurityDto) {
    await this.repo.update(userId, updateSecurityDto);
    return this.findById(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    await this.repo.update(userId, { password: hashedNewPassword });
    return true;
  }

  async remove(userId: string): Promise<boolean> {
    const result = await this.repo.delete(userId);
    return (result.affected ?? 0) > 0;
  }

  async updatePlan(userId: string, planId: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) return null;

    user.planId = planId;
    return this.repo.save(user);
  }
}
