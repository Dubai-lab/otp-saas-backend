/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { User } from '../users/user.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    // First find the user using the proper User repository
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user && user.planId) {
      // Check if planId is a valid UUID (not 'current' or other invalid values)
      const planId = user.planId;
      if (
        planId &&
        planId !== 'current' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          planId,
        )
      ) {
        // Load the plan separately if planId is valid
        try {
          const plan = await this.findOne(planId);
          return plan;
        } catch {
          // If plan not found, fall back to default
        }
      }
    }

    // Return default plan if user has no valid plan
    try {
      return await this.findDefaultPlan();
    } catch {
      // If no default plan exists, create a fallback plan
      const fallbackPlan = this.planRepository.create({
        name: 'Free',
        otpLimit: 100,
        smtpLimit: 1,
        templateLimit: 1,
        apiKeyLimit: 1,
        price: 0,
        currency: 'USD',
        isDefault: true,
      });
      return this.planRepository.save(fallbackPlan);
    }
  }
}
