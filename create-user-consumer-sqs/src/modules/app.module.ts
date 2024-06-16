import { SQSClient } from '@aws-sdk/client-sqs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from '../controllers/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
  controllers: [],
  providers: [
    {
      inject: [ConfigService],
      provide: 'SQS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const client = new SQSClient({
          region: configService.get<string>('SQS_REGION'),
          credentials: {
            accessKeyId: configService.get<string>('SQS_ACCESS_KEY'),
            secretAccessKey: configService.get<string>('SQS_SECRET'),
          },
        });
        return client;
      },
    },
    AppController,
  ],
})
export class AppModule {}
