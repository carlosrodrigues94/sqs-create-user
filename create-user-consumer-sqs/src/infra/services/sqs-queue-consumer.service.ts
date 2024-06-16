import {
  DeleteMessageBatchCommand,
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

export class SqsQueueConsumerService {
  protected client: SQSClient;
  protected queue = 'create-user-sqs.fifo';
  protected queueUrl =
    'https://sqs.sa-east-1.amazonaws.com/549161973214/create-user-sqs.fifo';
  constructor(sqsClient: SQSClient) {
    this.client = sqsClient;
  }

  async consume(callback: (data: Message) => Promise<void>) {
    const receiveMessage = (queueUrl) =>
      this.client.send(
        new ReceiveMessageCommand({
          MaxNumberOfMessages: 10,
          MessageAttributeNames: ['All'],
          QueueUrl: queueUrl,
          WaitTimeSeconds: 10,
          VisibilityTimeout: 20,
        }),
      );

    const { Messages } = await receiveMessage(this.queueUrl);

    if (!Messages) {
      return;
    }

    if (Messages.length) {
      for (const message of Messages) {
        console.log('MESSAGE: ', message.Body);
      }
    }
    if (Messages.length === 1) {
      await callback(Messages[0]);

      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: Messages[0].ReceiptHandle,
        }),
      );
    }
    if (Messages.length > 1) {
      for await (const message of Messages) {
        await callback(message);

        await this.client.send(
          new DeleteMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: Messages.map((message) => ({
              Id: message.MessageId,
              ReceiptHandle: message.ReceiptHandle,
            })),
          }),
        );
      }
    }
  }
}
