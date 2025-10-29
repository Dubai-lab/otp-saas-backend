import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '../users/user.entity';
import { Plan } from '../plans/entities/plan.entity';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-09-30.clover',
    });
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Verify user and plan exist
    const user = await this.userRepository.findOne({
      where: { id: createPaymentDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.planRepository.findOne({
      where: { id: createPaymentDto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: createPaymentDto.status || PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['user', 'plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async createPaymentIntent(
    userId: string,
    planId: string,
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.planRepository.findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Create payment record
    const payment = await this.create({
      userId,
      planId,
      amount: plan.price,
      currency: 'usd',
      description: `Subscription to ${plan.name} plan`,
    });

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        paymentId: payment.id,
        userId,
        planId,
      },
    });

    // Update payment with Stripe payment intent ID
    payment.stripePaymentIntentId = paymentIntent.id;
    await this.paymentRepository.save(payment);

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(event: any): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (event.type) {
      case 'payment_intent.succeeded':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.handlePaymentFailure(event.data.object);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      where: { stripePaymentIntentId: paymentIntent.id },
      relations: ['user', 'plan'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    payment.status = PaymentStatus.COMPLETED;
    await this.paymentRepository.save(payment);

    // Update user's plan
    const user = payment.user;
    user.planId = payment.planId;
    await this.userRepository.save(user);
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.FAILED;
    await this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    return this.paymentRepository.save(payment);
  }
}
