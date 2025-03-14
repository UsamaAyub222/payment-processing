import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PaymentAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Payment, payment => payment.attempts)
  payment: Payment;

  @Column()
  attempt_number: number;

  @Column({ type: 'enum', enum: ['success', 'failure'] })
  status: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}