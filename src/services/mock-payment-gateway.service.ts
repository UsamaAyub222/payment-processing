import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockPaymentGatewayService {
  processPayment(orderId: string, amount: number): Observable<AxiosResponse<any>> {
    const random = Math.random();
    const response = random > 0.5 ? 
      { status: 'success', transaction_id: `txn-${Math.floor(Math.random() * 100000)}` } :
      { status: 'failure', error: 'Payment failed' };
    return of({ data: response } as AxiosResponse);
  }
}