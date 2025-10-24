import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMTPConfig } from './smtp.entity';
import { UsersService } from '../users/user.service';
import { CreateSmtpDto } from './dto/create-smtp.dto';
import { UpdateSmtpDto } from './dto/update-smtp.dto';
import { encryptSecret } from '../../common/utils/crypto.util';

@Injectable()
export class SMTPService {
  constructor(
    @InjectRepository(SMTPConfig) private readonly repo: Repository<SMTPConfig>,
    private readonly usersService: UsersService,
  ) {}

  async upsertForUser(userId: string, dto: CreateSmtpDto | UpdateSmtpDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // find existing by name for this user (1 config per name)
    let cfg = await this.repo.findOne({
      where: { user: { id: userId }, name: dto.name as string },
    });

    const patch = {
      name: dto.name ?? cfg?.name,

      host: dto.host ?? cfg?.host,

      port: dto.port ?? cfg?.port,

      email: dto.email ?? cfg?.email,
      passwordEncrypted: dto.password
        ? encryptSecret(dto.password)
        : cfg?.passwordEncrypted,
    };

    if (!cfg) {
      cfg = this.repo.create({ ...patch, user });
    } else {
      Object.assign(cfg, patch);
    }

    const saved = await this.repo.save(cfg);

    // never return secrets
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordEncrypted, ...rest } = saved;
    return { ...rest, password: '********' };
  }

  async getAllForUser(userId: string) {
    const list = await this.repo.find({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return list.map(({ passwordEncrypted, ...rest }) => ({
      ...rest,
      password: '********',
    }));
  }

  async getOneById(userId: string, id: string) {
    const cfg = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!cfg) throw new NotFoundException('SMTP config not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordEncrypted, ...rest } = cfg;
    return { ...rest, password: '********' };
  }

  async remove(userId: string, id: string) {
    const cfg = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!cfg) throw new NotFoundException('SMTP config not found');
    await this.repo.remove(cfg);
    return { message: 'SMTP config removed' };
  }
}
