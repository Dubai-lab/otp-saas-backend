import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { UsersService } from '../users/user.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template) private readonly repo: Repository<Template>,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateTemplateDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const template = this.repo.create({
      user,
      name: dto.name,
      subject: dto.subject,
      headerText: dto.headerText,
      bodyText: dto.bodyText,
      footerText: dto.footerText,
      styles: dto.styles,
    });

    return this.repo.save(template);
  }

  findAll(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(userId: string, id: string, dto: UpdateTemplateDto) {
    const temp = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!temp) throw new NotFoundException('Template not found');

    Object.assign(temp, dto);
    return this.repo.save(temp);
  }

  async remove(userId: string, id: string) {
    const temp = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!temp) throw new NotFoundException('Template not found');

    await this.repo.remove(temp);
    return { message: 'Template removed' };
  }

  async findAllForAdmin() {
    return this.repo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
