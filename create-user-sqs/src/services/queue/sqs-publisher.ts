import {
  SQSClient,
  SendMessageCommand,
  paginateListQueues,
} from '@aws-sdk/client-sqs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export abstract class IQueuePublisherService {
  abstract publish(data: any): Promise<any>;
}

@Injectable()
export class SqsPublisherService implements IQueuePublisherService {
  protected queueName = 'create-user-sqs.fifo';
  protected groupId = 'CREATE_USER_FIFO_GROUP_ID';
  protected queueUrl: string;
  protected client: SQSClient;

  constructor(private readonly configService: ConfigService) {
    if (!this.client) {
      this.client = new SQSClient({
        region: this.configService.get<string>('SQS_REGION'),
        credentials: {
          secretAccessKey: this.configService.get<string>('SQS_SECRET'),
          accessKeyId: this.configService.get<string>('SQS_ACCESS_KEY'),
        },
      });
    }
  }

  async getQueue(name: string): Promise<string | undefined> {
    const queues = paginateListQueues({ client: this.client }, {});

    for await (const page of queues) {
      const nextUrls = page.QueueUrls?.filter((queue) => !!queue) || [];
      nextUrls.find((item) => {
        if (item.includes(name)) {
          this.queueUrl = item;
        }
      });
    }

    return this.queueUrl;
  }

  async publish(data: Record<string, any>): Promise<void> {
    try {
      const queue = await this.getQueue(this.queueName);
      if (!queue) return;

      const command = new SendMessageCommand({
        MessageGroupId: this.groupId,
        MessageBody: JSON.stringify({
          ...data,
          createdAt: new Date().toUTCString(),
        }),
        QueueUrl: this.queueUrl,
        // Prevent duplication for read message, mandatory for FIFO standard
        MessageDeduplicationId: randomUUID().toString(),
        MessageAttributes: {
          correlationId: {
            DataType: 'String',
            StringValue: randomUUID().toString(),
          },
          eventType: {
            DataType: 'String',
            StringValue: 'CREATE_USER',
          },
        },
      });

      await this.client.send(command);
    } catch (err) {
      throw new BadRequestException('Error SQS CLIENT', err.message);
    }
  }
}
