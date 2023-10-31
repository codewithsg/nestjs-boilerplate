import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer';
import { Request } from 'express';
import { UpdateUserDto } from 'src/auth/dto/updateUser.dto';
import { ResponseHelper } from 'src/response.helper';
/**
 * use authentication guard or authentication middleware for whole controller
 */
@UseGuards(AuthenticationGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: UsersService,
    @Inject(ResponseHelper) private readonly responseHelper: ResponseHelper,
  ) {}

  @Patch('/change-image')
  @UseInterceptors(FileInterceptor('image', multerConfig('user')))
  async uploadImage(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Cannot find image file.');
    await this.userService.update(req.authorizedUser.id, {
      image: file.path,
    });
    return this.responseHelper.sendSuccessRes(
      'Image uploaded successfullt',
      HttpStatus.OK,
    );
  }

  @Get()
  async getUsers() {
    const users = await this.userService.findAll();
    return this.responseHelper.sendSuccessRes(
      'Fetched all users.',
      HttpStatus.OK,
      users,
    );
  }

  @Get('/:userId')
  async getUserById(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found.');
    else
      return this.responseHelper.sendSuccessRes(
        'User fetched successfully.',
        HttpStatus.OK,
        user,
      );
  }

  @Patch('/:userId')
  @UsePipes(ValidationPipe)
  async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUser: UpdateUserDto,
  ) {
    const user = await this.userService.update(userId, updateUser);
    if (!user)
      throw new BadRequestException('User information cannot be updated.');
    return this.responseHelper.sendSuccessRes(
      'User updated successfully.',
      HttpStatus.OK,
      user,
    );
  }
}
