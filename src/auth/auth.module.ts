import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { TokenService } from './token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationGuard } from '../guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token/model/token.entity';
import { User } from 'src/users/model/user.entity';
import { ResponseHelper } from 'src/response.helper';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'USER_SERVICE',
      useClass: UsersService,
    },
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
    {
      provide: 'TOKEN_SERVICE',
      useClass: TokenService,
    },
    {
      provide: 'APP_GUARD',
      useClass: AuthenticationGuard,
    },
    {
      provide: 'ROLE_GUARD',
      useClass: RolesGuard,
    },
    TokenService,
    ResponseHelper,
  ],
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([Token, User]),
  ],
})
export class AuthModule {}
