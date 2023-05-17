import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/loginUser.dto';
import { comparePassword } from 'src/utils/passwordService';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.userService.findByEmail(loginUserDto.email);
      if (!user) {
        throw new NotFoundException('User with provided email not found.');
      }
      const isPasswordMatched = comparePassword(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordMatched) {
        throw new UnauthorizedException(
          'Sorry wrong password, check your password and try again.',
        );
      }
      const token = await this.jwtService.signAsync({ id: user.id });
      return {
        access_token: token,
        user,
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user) {
      const isPasswordMatched = comparePassword(password, user.password);
      if (isPasswordMatched) {
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}
