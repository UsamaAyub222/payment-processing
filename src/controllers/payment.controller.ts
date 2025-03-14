import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async processPayment(@Body('order_id') orderId: string, @Body('amount') amount: number) {
    return this.paymentService.processPayment(orderId, amount);
  }
}