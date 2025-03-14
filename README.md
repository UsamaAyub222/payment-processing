# Payment Processor

This project implements a payment processing workflow with retries, idempotency, and concurrency handling. It is built using NestJS, TypeORM, and MySQL, and is designed to handle payment requests efficiently and reliably.

## Features
### Concurrency Handling
- **Unique Constraints**: The order_id column in the payments table is marked as unique. This ensures that no two payments with the same order_id can be processed simultaneously.
- **Database-Level Locking**: Transactions are used to lock the database rows during payment processing, preventing race conditions.

### Retry Logic.
- Failed payments are retried up to 3 times.
- Exponential backoff is used between retries (1s, 2s, 4s).


### Trade-offs
- **Performance vs. Consistency**: Database-level locking ensures consistency but may impact performance under high concurrency.

### Idempotency guarantees.
- **Unique order_id**: Ensures that the same order_id cannot be processed more than once.
- **Database Transactions**: Ensures atomicity when updating payment and payment attempt records.
- Audit logging for payment attempts.

---
## How to Run
1. Clone the Repository:
   ```bash
   git clone https://github.com/your-username/nestjs-analytics.git
   cd nestjs-payment
  ```
2. Start Docker containers: `docker-compose up --build`.
3. Run the application: `npm run start`.
4. Test using Postman or curl.
```bash
curl --location 'http://localhost:3000/payment' \
--header 'Content-Type: application/json' \
--data '{"order_id": "order-124", "amount": 100.00}'
```
