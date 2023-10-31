import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/utils/constants';
import { DataSource } from 'typeorm';

@Injectable()
export class CheckDataAvailabilityGuard implements CanActivate {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params[this.getIdName(context)];
    const entityClass = this.getEntityClass(context);
    const data = await this.dataSource
      .getRepository(entityClass)
      .findOneBy({ id: id });
    console.log('data::', data);
    if (!data) {
      throw new NotFoundException(
        'Data is not available with the provided id.',
      );
    }

    if (
      request.authorizedUser.role === ROLE.admin ||
      request.authorizedUser.id === data.userId
    ) {
      return true;
    }
    throw new ForbiddenException(
      'You are not authorized to change data information with provided id.',
    );
  }

  private getEntityClass(context: ExecutionContext) {
    return this.reflector.get<string>('entityClass', context.getHandler());
  }

  private getIdName(context: ExecutionContext) {
    return this.reflector.get<string>('idName', context.getHandler());
  }
}
