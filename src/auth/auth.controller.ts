import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotAcceptableException,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from 'src/auth/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { AllExceptionFilter } from 'src/exceptions/AllException.filter';
import { TokenService } from './token/token.service';
// import { mailTransporter } from 'src/utils/sendMail';
import { LoginUserDto } from './dto/loginUser.dto';
import { Public } from '../guards/decorator/public.decorator';
import { hashPassword } from 'src/utils/passwordService';
import { ResponseHelper } from 'src/response.helper';
import { EntityManager } from 'typeorm';
import { User } from 'src/users/model/user.entity';
import { Token } from './token/model/token.entity';
import * as crypto from 'crypto';
import { Response } from 'express';

/**
 * @Public() is to ignore authorization guards
 */
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    @Inject('USER_SERVICE') private readonly userService: UsersService,
    @Inject('TOKEN_SERVICE') private readonly tokenService: TokenService,
    @Inject(ResponseHelper) private readonly responseHelper: ResponseHelper,
    private readonly manager: EntityManager,
  ) {}

  /**
   * @UsePipes(ValidationPipe) this check for validation for createUserDto
   * @param createUserDto inside use validation useing class-validator
   * @returns new user
   */
  @Post('signup')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const isUserExists = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (isUserExists)
      throw new ConflictException(
        'User Already exists.',
        'Try again with another email.',
      );
    const hashedPassword = hashPassword(createUserDto.password);
    const { user, token } = await this.manager.transaction(
      async (transactionalEntityManager) => {
        const savedUser = await transactionalEntityManager.save(User, {
          ...createUserDto,
          password: hashedPassword,
        });
        if (!savedUser)
          throw new BadRequestException('User cannot be created.');

        const token = {
          value: crypto.randomBytes(20).toString('hex'),
          userId: savedUser.id,
        };

        await transactionalEntityManager.save(Token, token);
        return { user: savedUser, token };
      },
    );
    /* Send Mail */
    // const emailConfig = {
    //     from: process.env.NODEMAILER_EMAIL,
    //     to: user.email,
    //     subject: 'Verify Your Account',
    //     html: `http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/auth/verify?token=${token.value}`,
    // }
    // await mailTransporter.sendMail(emailConfig);

    res.send(
      this.responseHelper.sendSuccessRes(
        'User created successfully.',
        HttpStatus.CREATED,
        {
          user,
          token,
        },
      ),
    );
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @UseFilters(AllExceptionFilter)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loggedInUser = await this.authService.login(loginUserDto);
    res.cookie('token', `Bearer ${loggedInUser.access_token}`);
    return this.responseHelper.sendSuccessRes(
      'Login successfull.',
      HttpStatus.OK,
      loggedInUser,
    );
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() { email }) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found.');
    const token = await this.tokenService.create(user.id);

    /* send mail */
    /* const emailConfig = replace below object and replace ';'  with ','*/
    {
      from: process.env.FROM_MAIL;
      to: user.email;
      subject: 'Reset your password';
      html: `http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/auth/reset-password?token=${token.value}`;
    }
    // await mailTransporter.sendMail(emailConfig);
    return this.responseHelper.sendSuccessRes(
      'Reset link has been sent to your mail.',
      HttpStatus.OK,
    );
  }

  @Patch('/reset-password')
  async resetPassword(@Body() { password }, @Query('token') token: string) {
    if (!token)
      throw new UnauthorizedException(
        'This is not a valid url to reset password.',
      );
    if (!password) throw new NotAcceptableException('Please provide password.');
    const myToken = await this.tokenService.getByToken(token as string);
    if (!myToken) {
      throw new NotFoundException('Token not found, use forgot-password.');
    }
    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete('tokens', { id: myToken.id });
      await transactionalEntityManager.save('users', {
        id: myToken.userId,
        password: hashPassword(password),
      });
    });
    return this.responseHelper.sendSuccessRes(
      'Successfully reset password.',
      HttpStatus.OK,
    );
  }

  @Get('/verify')
  async verifyUser(@Query('token') token: string) {
    if (!token) throw new NotAcceptableException('User not verified.');
    const myToken = await this.tokenService.getByToken(token);
    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save('users', {
        id: myToken.userId,
        verified: true,
      });
      await transactionalEntityManager.delete('tokens', myToken);
    });
    return this.responseHelper.sendSuccessRes(
      'Successfully verified user.',
      HttpStatus.OK,
    );
  }
}
