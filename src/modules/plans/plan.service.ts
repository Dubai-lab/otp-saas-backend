import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    // Check if plan name already exists
    const existingPlan = await this.planRepository.findOne({
      where: { name: createPlanDto.name },
    });

    if (existingPlan) {
      throw new ConflictException('Plan with this name already exists');
    }

    // If this is the default plan, unset other defaults
    if (createPlanDto.isDefault) {
      await this.planRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }

    const plan = this.planRepository.create(createPlanDto);
    return this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async findDefaultPlan(): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { isDefault: true },
    });

    if (!plan) {
      throw new NotFoundException('Default plan not found');
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);

    // If setting as default, unset other defaults
    if (updatePlanDto.isDefault) {
      await this.planRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }

    // Check name uniqueness if name is being updated
    if (updatePlanDto.name && updatePlanDto.name !== plan.name) {
      const existingPlan = await this.planRepository.findOne({
        where: { name: updatePlanDto.name },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    Object.assign(plan, updatePlanDto);
    return this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);

    // Prevent deletion of default plan
    if (plan.isDefault) {
      throw new ConflictException('Cannot delete default plan');
    }

    await this.planRepository.remove(plan);
  }

  async findCurrentUserPlan(userId: string): Promise<Plan> {
    const user = (await this.planRepository.manager.findOne('User', {
      where: { id: userId },
      relations: ['plan'],
    })) as { id: string; plan?: Plan };

    if (!user || !user.plan) {
      // Return default plan if user has no plan
      return await this.findDefaultPlan();
    }

    return user.plan;
  }
}
