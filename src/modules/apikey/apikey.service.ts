import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './apikey.entity';
import { UsersService } from '../users/user.service';
import { CreateApiKeyDto } from './dto/create-apikey.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey) private repo: Repository<ApiKey>,
    private usersService: UsersService,
  ) {}

  async generate(userId: string, dto: CreateApiKeyDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const raw = crypto.randomBytes(32).toString('hex');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hash = await bcrypt.hash(raw, 10);

    const key = this.repo.create({
      user,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      keyHash: hash,
      label: dto.label || 'Default Key',
    });
    await this.repo.save(key);

    return {
      message: 'API Key generated successfully',
      apiKey: raw, // 👈 only shown once!
      id: key.id,
    };
  }

  async list(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      select: ['id', 'label', 'createdAt', 'updatedAt'], // don't return hash
    });
  }

  async remove(userId: string, id: string) {
    const key = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!key) throw new NotFoundException('API Key not found');

    await this.repo.remove(key);
    return { message: 'API Key deleted' };
  }

  async validate(rawKey: string) {
    const all = await this.repo.find({ relations: ['user'] });

    for (const key of all) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const match = await bcrypt.compare(rawKey, key.keyHash);
      if (match) return key.user;
    }

    return null;
  }
}
