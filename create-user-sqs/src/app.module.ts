import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { CreateUserUsecase, IUsecase } from './create-user.usecase';
import {
  IQueuePublisherService,
  SqsPublisherService,
} from './services/queue/sqs-publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: IQueuePublisherService,
      useClass: SqsPublisherService,
    },
    {
      provide: IUsecase,
      useClass: CreateUserUsecase,
    },
  ],
})
export class AppModule {}
