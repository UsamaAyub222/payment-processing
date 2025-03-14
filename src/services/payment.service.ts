import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentAttempt } from '../entities/payment-attempt.entity';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentAttempt)
    private attemptRepository: Repository<PaymentAttempt>,
    private mockPaymentGateway: MockPaymentGatewayService,
  ) {}

  async processPayment(orderId: string, amount: number): Promise<any> {
    const queryRunner = this.paymentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      let payment = await queryRunner.manager.findOne(Payment, { where: { order_id: orderId } });
  
      if (!payment) {
        payment = new Payment();
        payment.order_id = orderId;
        payment.amount = amount;
        payment.status = 'pending';
        await queryRunner.manager.save(Payment, payment);
      }
  
      const result = await this.retryPayment(payment, queryRunner);
  
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Payment processing failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async retryPayment(payment: Payment, queryRunner: any, attempt = 1): Promise<any> {
    const maxAttempts = 3;
    const backoff = Math.pow(2, attempt - 1) * 1000;
  
    try {
      const response = await this.mockPaymentGateway.processPayment(payment.order_id, payment.amount).toPromise();
      if (!response || !response.data) {
        throw new Error('Invalid response from payment gateway');
      }
  
      const attemptRecord = new PaymentAttempt();
      attemptRecord.payment = payment;
      attemptRecord.attempt_number = attempt;
      attemptRecord.status = response.data.status === 'success' ? 'success' : 'failure';
      attemptRecord.response = JSON.stringify(response.data);
      await queryRunner.manager.save(PaymentAttempt, attemptRecord);
  
      if (response.data.status === 'success') {
        payment.status = 'completed';
        payment.payment_gateway_response = JSON.stringify(response.data);
        await queryRunner.manager.save(Payment, payment);
        return { message: 'Payment successful', data: response.data };
      } else if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.retryPayment(payment, queryRunner, attempt + 1);
      } else {
        payment.status = 'failed';
        await queryRunner.manager.save(Payment, payment);
        throw new Error('Payment failed after maximum attempts');
      }
    } catch (error) {
      this.logger.error(`Payment attempt ${attempt} failed: ${error.message}`);
      throw error;
    }
  }
}