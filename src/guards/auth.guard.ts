import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { IUser } from './../types/User';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject('USER_SERVICE') private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'You are not authorized, login again to continue.',
      );
    }
    try {
      const payload: IUser = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userService.findById(payload.id);
      if (!user)
        throw new NotFoundException(`User not found with ${payload.id} id.`);
      request['authorizedUser'] = user;
    } catch {
      throw new UnauthorizedException('Login again to continue.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.cookies.token
      ? request.cookies.token.split(' ')
      : request.headers.authorization?.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
