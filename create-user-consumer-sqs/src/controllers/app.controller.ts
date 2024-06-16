import { Message, SQSClient } from '@aws-sdk/client-sqs';
import { Inject } from '@nestjs/common';
import { SqsQueueConsumerService } from 'src/infra/services/sqs-queue-consumer.service';

export class AppController extends SqsQueueConsumerService {
  constructor(@Inject('SQS_CLIENT') sqsClient: SQSClient) {
    super(sqsClient);

    setInterval(() => {
      console.log('Consuming AGAIN');
      this.consume(this.handleMessage);
    }, 5000);
  }
  createUser(): string {
    return 'hello';
  }

  async handleMessage(data: Message) {
    console.log('Message on Controller', JSON.parse(data.Body));
  }
}
