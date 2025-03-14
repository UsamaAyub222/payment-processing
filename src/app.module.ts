import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { MockPaymentGatewayService } from './services/mock-payment-gateway.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'nest',
      password: 'nest',
      database: 'nest_payments',
      entities: [Payment, PaymentAttempt],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Payment, PaymentAttempt]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, MockPaymentGatewayService],
})
export class AppModule {}