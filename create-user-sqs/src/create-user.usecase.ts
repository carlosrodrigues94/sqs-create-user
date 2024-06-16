import { BadRequestException, Injectable } from '@nestjs/common';

import { IQueuePublisherService } from './services/queue/sqs-publisher';

export abstract class IUsecase<T, P> {
  abstract execute(data: T): Promise<P>;
}

@Injectable()
export class CreateUserUsecase implements IUsecase<any, any> {
  protected queue = 'create-user-sqs.fifo';
  constructor(private readonly queuePublishService: IQueuePublisherService) {}
  async execute(data: Record<string, any>) {
    if (!data.name || !data.age) {
      throw new BadRequestException('Invalid Body');
    }
    const { name, age } = data;
    await this.queuePublishService.publish({ name, age });
    return { ok: true };
  }
}
