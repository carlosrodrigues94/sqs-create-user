import { Body, Controller, Post } from '@nestjs/common';
import { IUsecase } from '../create-user.usecase';

@Controller()
export class AppController {
  constructor(private readonly usecase: IUsecase<any, any>) {}

  @Post('/users')
  publish(@Body() body: Record<string, string>) {
    return this.usecase.execute(body);
  }
}
