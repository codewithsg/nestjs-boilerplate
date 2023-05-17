import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';
import { CreateUserDto } from '../auth/dto/createUser.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from 'src/utils/passwordService';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.save(createUserDto);
    return user;
  }

  findAll() {
    return this.userRepository.find();
  }

  findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: number, updateDetail: Partial<User>) {
    let user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    if (updateDetail.password) {
      updateDetail = {
        ...updateDetail,
        password: await hashPassword(updateDetail.password),
      };
    }
    user = { ...user, ...updateDetail };
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }

  async changePassword(id: number, password: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.password = password;
    return await this.userRepository.save(user);
  }
}
