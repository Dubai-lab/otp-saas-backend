import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles('admin')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles('admin')
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('my-payments')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  findMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Post('create-payment-intent')
  createPaymentIntent(
    @Body() body: { planId: string },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentService.createPaymentIntent(userId, body.planId);
  }

  @Post('webhook')
  async handleWebhook(
    @Body() webhookEvent: WebhookEventDto,
    @Headers('stripe-signature') _signature: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    // Note: In production, you should verify the webhook signature
    // For now, we'll trust the event data
    await this.paymentService.handleWebhook(webhookEvent);
    return { received: true };
  }
}
